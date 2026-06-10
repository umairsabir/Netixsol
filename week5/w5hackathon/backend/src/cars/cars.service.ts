import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Car, CarDocument, CarStatus } from './car.schema';
import { Bid, BidDocument } from '../bids/bid.schema';
import { CreateCarDto } from './dto/create-car.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BidsGateway } from '../notifications/bids.gateway';

export interface CarFilters {
  make?: string;
  model?: string;
  year?: number;
  category?: string;
  paint?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

@Injectable()
export class CarsService {
  constructor(
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    private cloudinary: CloudinaryService,
    private bidsGateway: BidsGateway,
  ) {}

  async create(dto: CreateCarDto, userId: string, files: Express.Multer.File[]): Promise<CarDocument> {
    const images = files?.length ? await this.cloudinary.uploadImages(files) : [];
    const lotNumber = `LOT-${Math.floor(1000 + Math.random() * 9000)}`;
    let auctionEndDate = dto.auctionEndDate ? new Date(dto.auctionEndDate) : undefined;
    if (!auctionEndDate && dto.auctionDuration) {
      auctionEndDate = new Date();
      auctionEndDate.setDate(auctionEndDate.getDate() + dto.auctionDuration);
    }

    const data = { 
      ...dto, 
      uploadedBy: new Types.ObjectId(userId), 
      images,
      lotNumber,
      minIncrement: dto.minIncrement || 100,
      auctionEndDate
    } as any;
    const car = (await this.carModel.create([data]))[0] as CarDocument;
    if (car.status === CarStatus.LIVE) {
      this.bidsGateway.notifyNewAuction(car);
    }
    return car;
  }

  async findAll(filters: CarFilters = {}): Promise<CarDocument[]> {
    const query: Record<string, any> = {};
    if (filters.make) query.make = new RegExp(`^${filters.make}$`, 'i');
    if (filters.model) query.model = new RegExp(`^${filters.model}$`, 'i');
    if (filters.year) query.year = filters.year;
    if (filters.category) query.category = new RegExp(`^${filters.category}$`, 'i');
    if (filters.paint) query.paint = new RegExp(`^${filters.paint}$`, 'i');
    
    if (filters.status) {
      query.status = filters.status;
    } else {
      query.status = CarStatus.LIVE;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.currentBid = {};
      if (filters.minPrice !== undefined) query.currentBid.$gte = filters.minPrice;
      if (filters.maxPrice !== undefined) query.currentBid.$lte = filters.maxPrice;
    }
    return this.carModel.find(query).populate('uploadedBy', 'firstName lastName email').sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<CarDocument> {
    const car = await this.carModel.findById(id).populate('uploadedBy', 'firstName lastName email');
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async findByUser(userId: string): Promise<CarDocument[]> {
    return this.carModel.find({ uploadedBy: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  async updateCurrentBid(carId: string, amount: number): Promise<void> {
    await this.carModel.findByIdAndUpdate(carId, { currentBid: amount });
  }

  async incrementBidCount(carId: string): Promise<void> {
    await this.carModel.findByIdAndUpdate(carId, { $inc: { bidCount: 1 } });
  }

  async markAsCompleted(carId: string): Promise<void> {
    await this.carModel.findByIdAndUpdate(carId, { status: CarStatus.SOLD });
  }

  async endAuction(carId: string, userId: string): Promise<CarDocument> {
    const car = await this.carModel.findById(carId);
    if (!car) throw new NotFoundException('Car not found');

    if (car.uploadedBy.toString() !== userId) {
      throw new ForbiddenException('You can only end your own auctions');
    }

    car.status = CarStatus.SOLD;
    const updated = await car.save();

    // Notify Winner
    const topBid = await this.bidModel
      .findOne({ car: new Types.ObjectId(carId) })
      .sort({ amount: -1 })
      .populate('user', 'firstName lastName email')
      .populate('car', 'title slug');

    if (topBid) {
      this.bidsGateway.broadcastAuctionEnded(carId, topBid);
      this.bidsGateway.notifyAuctionWinner(topBid);
    }
    
    this.bidsGateway.notifyAuctionClosed(updated);
    return updated;
  }
}
