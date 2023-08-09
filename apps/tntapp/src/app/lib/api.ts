export async function fetchData(url: RequestInfo | URL, token?: string) {
  const response = await fetch(url, {
    headers: [['authorization: ', token ?? '']],
  });
  const data = await response.json();
  return data;
}
export async function postData(url: string, data: any, token?: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: [
      ['Content-Type', 'application/json'],
      ['authorization', token ?? ''],
    ],
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  return responseData;
}
