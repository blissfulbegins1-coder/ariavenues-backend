import axios, { AxiosInstance } from "axios";
import {
  auth_Key,
  baseUrl,
  templateId,
  otpTimeout,
  Environment,
  otpMockValue,
} from "../../../domain/constants/constants";
import { ApiError } from "../../../domain/errors/ApiError";

interface Msg91Response {
  type: "success" | "error";
  message: string;
}

export class OtpService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        authkey: auth_Key,
        "Content-Type": "application/json",
      },
    });
  }

  async sendOtp(mobile: string): Promise<boolean> {
    if (Environment !== "production") {
      console.log(`[MOCK OTP] Sent OTP to ${mobile}`);
      return true;
    }

    try {
      const { data } = await this.client.post<Msg91Response>(
        "",
        {},
        {
          params: {
            template_id: templateId,
            mobile,
            otp_expiry: otpTimeout,
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
    if (Environment !== "production") {
      if (otp === otpMockValue) {
        return true;
      }

      throw new ApiError("Invalid OTP");
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
      throw new ApiError(response.message);
    }
  }

  private handleAxiosError(error: unknown, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message;

      throw new ApiError(message);
    }

    if (error instanceof Error) {
      throw new ApiError(error.message);
    }

    throw new ApiError(defaultMessage);
  }
}