export const status = async (event: any, context: any) => {
  const response = {
      statusCode: 200,
      body: JSON.stringify('Hello TEST!'),
  };
  return response;
};
