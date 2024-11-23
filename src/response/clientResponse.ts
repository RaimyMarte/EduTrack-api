export class ClientResponse {
  data: object | Array<object> | null = null;
  isSuccess: boolean = true;
  message: string = '';
  title: string = '';
  total: number = 0;

  copyResponse(clientResponse: ClientResponse) {
    this.data = clientResponse.data;
    this.isSuccess = clientResponse.isSuccess;
    this.message = clientResponse.message;
    this.title = clientResponse.title;
    this.total = clientResponse.total;
  }
}
