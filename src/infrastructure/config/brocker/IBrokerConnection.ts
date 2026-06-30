export interface IBrokerConnection {
  connect(): Promise<void>;
  getChannel(): any;
  close(): Promise<void>;
}
