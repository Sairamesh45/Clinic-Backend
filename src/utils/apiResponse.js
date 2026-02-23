export const successResponse = (data, meta) => ({
  status: "success",
  data,
  meta,
});

export const createdResponse = (data) => successResponse(data);
