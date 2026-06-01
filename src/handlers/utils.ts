import { ToolResultSchema } from "../types.js";

/**
 * Utility function to create an error response
 * @param message The error message
 * @returns A ToolResultSchema with the error message
 */
export const createErrorResponse = (message: string): ToolResultSchema => {
  return {
    content: [{
      type: "text",
      text: message
    }],
    isError: true
  };
};

/**
 * Utility function to create a success response
 * @param message The success message
 * @returns A ToolResultSchema with the success message
 */
export const createSuccessResponse = (message: string): ToolResultSchema => {
  return {
    content: [{
      type: "text",
      text: message
    }],
    isError: false
  };
};

/**
 * Utility function to return structured data as a compact (minified) JSON
 * response. Compact JSON keeps the payload small and directly parseable by
 * model clients, unlike a prose-prefixed, pretty-printed blob.
 * @param data Any JSON-serializable value
 * @returns A ToolResultSchema wrapping the serialized data
 */
export const jsonResponse = (data: unknown): ToolResultSchema => {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(data)
    }],
    isError: false
  };
};
