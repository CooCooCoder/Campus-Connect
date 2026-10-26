class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      requestId: res.getHeader('X-Request-Id') || undefined
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        totalRecords: pagination.total,
        currentPage: pagination.page,
        pageSize: pagination.limit,
        totalPages: Math.ceil(pagination.total / pagination.limit),
        hasNextPage: pagination.page * pagination.limit < pagination.total,
        hasPrevPage: pagination.page > 1
      },
      requestId: res.getHeader('X-Request-Id') || undefined
    });
  }

  static error(res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    const response = {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {})
      },
      requestId: res.getHeader('X-Request-Id') || undefined
    };
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
