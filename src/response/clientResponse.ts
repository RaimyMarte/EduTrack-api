export class ClientResponse {
  data: object | Array<object> | null = null;
  isSuccess: boolean = true;
  message: string = '';
  title: string = '';

  copyResponse(clientResponse: ClientResponse) {
    this.data = clientResponse.data;
    this.isSuccess = clientResponse.isSuccess;
    this.message = clientResponse.message;
    this.title = clientResponse.title;
  }
}
