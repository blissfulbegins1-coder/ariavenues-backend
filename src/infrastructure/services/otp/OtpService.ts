import axios, { AxiosInstance } from "axios";
import {
  OTP_AUTH_KEY,
  OTP_BASE_URL,
  OTP_TEMPLATE_ID,
  OTP_TIMEOUT,
  NODE_ENV,
  OTP_MOCK_VALUE,
} from "@/config/env";
import { ApiError } from "../../../domain/errors/ApiError";
import { HttpStatus } from "../../../domain/enums/HttpStatus";
import { logger } from "../../../utils/logger";

type Msg91Response = {
  type: "success" | "error";
  message: string;
}

export class OtpService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: OTP_BASE_URL,
      timeout: 10000,
      headers: {
        authkey: OTP_AUTH_KEY,
        "Content-Type": "application/json",
      },
    });
  }

  async sendOtp(mobile: string): Promise<boolean> {
    if (NODE_ENV !== "production") {
      logger.info(`[MOCK OTP] Sent OTP to ${mobile}`);
      return true;
    }

    try {
      const { data } = await this.client.post<Msg91Response>(
        "",
        {},
        {
          params: {
            template_id: OTP_TEMPLATE_ID,
            mobile,
            otp_expiry: OTP_TIMEOUT,
          },
        }
      );

      this.ensureSuccess(data);

      return true;
    } catch (error) {
      this.handleAxiosError(error, "Failed to send OTP");
    }
  }

  async verifyOtp(mobile: string, otp: string): Promise<boolean> {
    if (NODE_ENV !== "production") {
      if (otp === OTP_MOCK_VALUE) {
        return true;
      }

      throw new ApiError("Invalid OTP", HttpStatus.BAD_REQUEST);
    }

    try {
      const { data } = await this.client.get<Msg91Response>("/verify", {
        params: {
          mobile,
          otp,
        },
      });

      this.ensureSuccess(data);

      return true;
    } catch (error) {
      this.handleAxiosError(error, "OTP verification failed");
    }
  }

  private ensureSuccess(response: Msg91Response): void {
    if (response.type !== "success") {
      throw new ApiError(response.message, HttpStatus.BAD_REQUEST);
    }
  }

  private handleAxiosError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message;

      throw new ApiError(message, HttpStatus.BAD_REQUEST);
    }

    if (error instanceof Error) {
      throw new ApiError(error.message, HttpStatus.BAD_REQUEST);
    }

    throw new ApiError(defaultMessage, HttpStatus.BAD_REQUEST);
  }
}