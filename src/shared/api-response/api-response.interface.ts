export interface ApiResponseDTO<T> {
  statusCode: number;
  body: T;
}
