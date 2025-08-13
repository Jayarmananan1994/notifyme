/**
 * Test utilities for backend testing
 */

export const createMockRequest = (options: any = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...options,
  };
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => {
  return jest.fn();
};