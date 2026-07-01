export type IBrokerConnection = {
  connect(): Promise<void>;
  getChannel(): any;
  close(): Promise<void>;
}
