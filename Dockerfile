# Production Dockerfile for x402 Facilitator
FROM ghcr.io/x402-rs/x402-rs:latest

# Set working directory
WORKDIR /app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Run facilitator
CMD ["x402-facilitator"]
