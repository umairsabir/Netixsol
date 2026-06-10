import { privateKeyToAddress } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

const pk = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY : `0x${process.env.PRIVATE_KEY}`;
const address = privateKeyToAddress(pk);
console.log("Deployer Address:", address);
