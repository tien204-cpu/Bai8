import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';

@Injectable()
export class VnpayProvider {
  private readonly logger = new Logger(VnpayProvider.name);

  constructor(private readonly configService: ConfigService) {}

  createPaymentUrl(
    orderId: string,
    amount: number,
    orderInfo: string,
    ipAddr: string,
  ): string {
    const tmnCode = this.configService.get('VNPAY_TMN_CODE', '');
    const secretKey = this.configService.get('VNPAY_HASH_SECRET', '');
    const vnpUrl = this.configService.get(
      'VNPAY_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    const returnUrl = this.configService.get(
      'VNPAY_RETURN_URL',
      'http://localhost:3000/api/payments/webhook/vnpay',
    );

    const date = new Date();
    const createDate = this.formatDate(date);

    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: String(amount * 100),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(params);
    const signData = querystring.stringify(sortedParams, '&', '=');
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    sortedParams['vnp_SecureHash'] = signed;

    return `${vnpUrl}?${querystring.stringify(sortedParams, '&', '=')}`;
  }

  verifyCallback(query: Record<string, string>): {
    isValid: boolean;
    orderId: string;
    transactionId: string;
    responseCode: string;
  } {
    const secretKey = this.configService.get('VNPAY_HASH_SECRET', '');
    const secureHash = query['vnp_SecureHash'];

    const params = { ...query };
    delete params['vnp_SecureHash'];
    delete params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(params);
    const signData = querystring.stringify(sortedParams, '&', '=');
    const hmac = crypto.createHmac('sha512', secretKey);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return {
      isValid: secureHash === checkSum,
      orderId: query['vnp_TxnRef'] || '',
      transactionId: query['vnp_TransactionNo'] || '',
      responseCode: query['vnp_ResponseCode'] || '',
    };
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      String(date.getFullYear()) +
      pad(date.getMonth() + 1) +
      pad(date.getDate()) +
      pad(date.getHours()) +
      pad(date.getMinutes()) +
      pad(date.getSeconds())
    );
  }
}
