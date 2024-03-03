// Function to fetch data from the server
export async function fetchData(
  url: RequestInfo | URL,
  token: string | undefined // Authorization token
) {
  const response = await fetch(url, {
    headers: [['authorization', token ?? 'x']], // Including authorization token in headers
  });
  const data = await response.json();
  return data; // Returning parsed data
}

// Function to post data to the server
export async function postData(
  url: string,
  data: any, // Data to be posted
  token: string | undefined
) {
  const response = await fetch(url, {
    method: 'POST', // POST method
    headers: [
      ['Content-Type', 'application/json'], // Specifying JSON content type in headers
      ['authorization', token ?? 'x'], // Including authorization token in headers
    ],
    body: JSON.stringify(data), // Converting data to JSON string and including in request body
  });
  const responseData = await response.json();
  return responseData;
}
