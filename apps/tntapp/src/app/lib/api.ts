export async function fetchData(url: RequestInfo | URL) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
export async function postData(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: [['Content-Type', 'application/json']],
    body: JSON.stringify(data),
  });
  const responseData = await response.json();
  return responseData;
}
