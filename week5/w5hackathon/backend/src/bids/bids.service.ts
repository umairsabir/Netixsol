import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bid, BidDocument } from './bid.schema';
import { CreateBidDto } from './dto/create-bid.dto';
import { CarsService } from '../cars/cars.service';
import { BidsGateway } from '../notifications/bids.gateway';

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    private carsService: CarsService,
    private bidsGateway: BidsGateway,
  ) {}

  async placeBid(dto: CreateBidDto, userId: string): Promise<BidDocument> {
    const car = await this.carsService.findById(dto.carId);
    if (!car) throw new NotFoundException('Car not found');

    if (car.uploadedBy._id.toString() === userId) {
      throw new BadRequestException('You cannot bid on your own car');
    }

    if (car.status !== 'live') {
      throw new BadRequestException('Auction is not live');
    }

    // Lazy Closing: Check if auction has expired but not yet marked as SOLD
    if (car.auctionEndDate && new Date() > new Date(car.auctionEndDate)) {
      await this.carsService.markAsCompleted(dto.carId);
      // We also need to fetch the highest bid to notify winner
      const bids = await this.findByCar(dto.carId);
      if (bids.length > 0) {
        const topBid = bids[0];
        this.bidsGateway.broadcastAuctionEnded(dto.carId, topBid);
        this.bidsGateway.notifyAuctionWinner(topBid);
      }
      this.bidsGateway.notifyAuctionClosed(car);
      throw new BadRequestException('Auction has ended');
    }

    if (dto.amount <= car.currentBid || dto.amount < car.startingBid) {
      throw new BadRequestException('Bid must be higher than current bid and starting bid');
    }

    // Check if user already has a bid on this car
    const existingBid = await this.bidModel.findOneAndUpdate(
      { 
        car: new Types.ObjectId(dto.carId), 
        user: new Types.ObjectId(userId) 
      },
      { amount: dto.amount },
      { upsert: true, new: false, setDefaultsOnInsert: true }
    );

    // If existingBid is null, it means a new bid was upserted (first time bidder)
    if (!existingBid) {
      await this.carsService.incrementBidCount(dto.carId);
    }

    await this.carsService.updateCurrentBid(dto.carId, dto.amount);
    
    // Get the final bid document (either new or updated) to populate and return
    const bid = await this.bidModel.findOne({ 
      car: new Types.ObjectId(dto.carId), 
      user: new Types.ObjectId(userId) 
    });

    if (!bid) throw new BadRequestException('Failed to place or update bid');

    const populatedBid = await bid.populate('user', 'firstName lastName email phone nationality idType profilePicture');
    this.bidsGateway.broadcastNewBid(dto.carId, populatedBid);
    this.bidsGateway.notifyGlobalBid(populatedBid);
    return populatedBid;
  }

  async findByCar(carId: string): Promise<BidDocument[]> {
    return this.bidModel.find({ car: new Types.ObjectId(carId) })
      .populate('user', 'firstName lastName email phone nationality idType profilePicture')
      .sort({ amount: -1 });
  }

  async findByUser(userId: string): Promise<BidDocument[]> {
    return this.bidModel.find({ user: new Types.ObjectId(userId) })
      .populate('car')
      .sort({ createdAt: -1 });
  }

  async findById(bidId: string): Promise<BidDocument> {
    const bid = await this.bidModel.findById(bidId).populate('car').populate('user');
    if (!bid) throw new NotFoundException('Bid not found');
    return bid;
  }

  async markAsPaid(bidId: string): Promise<BidDocument> {
    const bid = await this.bidModel.findByIdAndUpdate(bidId, { isPaid: true }, { new: true });
    if (!bid) throw new NotFoundException('Bid not found');
    this.bidsGateway.broadcastShippingUpdate(bidId, { step: 1, text: 'Ready for Shipping' });
    
    // Simulate shipping progress logic
    setTimeout(() => {
      this.bidsGateway.broadcastShippingUpdate(bidId, { step: 2, text: 'In Transit' });
    }, 60000);
    setTimeout(async () => {
      this.bidsGateway.broadcastShippingUpdate(bidId, { step: 3, text: 'Delivered' });
      await this.carsService.markAsCompleted(bid.car.toString());
      this.bidsGateway.broadcastAuctionEnded(bid.car.toString(), bid);
      this.bidsGateway.notifyAuctionWinner(bid);
    }, 120000);
    
    return bid;
  }
}
