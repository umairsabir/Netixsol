import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductsService {
  private readonly hygraphUrl: string;
  private readonly hygraphToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.hygraphUrl = this.configService.get<string>('HYGRAPH_API_URL') ?? '';
    this.hygraphToken = this.configService.get<string>('HYGRAPH_API_TOKEN') ?? '';
    console.log('Hygraph URL:', this.hygraphUrl);
  }

  async getProducts(category?: string) {
    const isFiltered = category && category !== 'ALL';
    const query = `
      query GetProducts($where: ProductWhereInput) {
        products(where: $where) {
          id
          name
          slug
          price
          featured
          shoeCategory
          description {
            text
          }
          image {
            url
          }
        }
      }
    `;

    const variables = isFiltered ? { where: { shoeCategory: category } } : {};

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          this.hygraphUrl,
          { query, variables },
          {
            headers: {
              Authorization: `Bearer ${this.hygraphToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.errors) {
        console.error('Hygraph errors:', JSON.stringify(response.data.errors));
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.products;
    } catch (error) {
      console.error('Error fetching products from Hygraph:', error.message);
      console.error('Full error:', JSON.stringify(error.response?.data));
      return []; 
    }
  }

}
