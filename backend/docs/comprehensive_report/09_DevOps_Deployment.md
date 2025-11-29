# DevOps, Deployment & CI/CD

## Git Branching Strategy
We use **Gitflow** or a simplified **Trunk-Based Development**:
- `main`: Production-ready code.
- `develop`: Integration branch for features.
- `feature/*`: Individual feature branches (e.g., `feature/payment-integration`).
- `hotfix/*`: Urgent fixes for production.

## CI/CD Pipeline (GitHub Actions)
Our pipeline automates the path from code to production.

### Workflow Steps:
1.  **Lint & Format:** Check code style (ESLint, Prettier).
2.  **Test:** Run Unit and Integration tests.
3.  **Build:** Compile TypeScript and Next.js apps.
4.  **Deploy (Staging):** If on `develop` branch, deploy to Staging environment.
5.  **Deploy (Production):** If on `main` branch, deploy to Production.

## Containerization (Docker)
- While we use Serverless (Functions), we use Docker for local development consistency and potentially for containerized services (like a custom Redis instance) on Cloud Run if needed.

## Infrastructure as Code (IaC)
- **Terraform:** Used to provision GCP resources (Buckets, IAM roles) to ensure reproducibility.

## Environments
- **Local:** Firebase Emulators running on developer machine.
- **Staging:** Exact replica of production with test data.
- **Production:** Live environment.

## Monitoring & Logging
- **Grafana:** Visualizing custom metrics (optional, if using Prometheus).
- **Google Cloud Monitoring:** Native dashboards for Function latency, execution times, and error rates.
- **ELK Stack (Elasticsearch, Logstash, Kibana):** (Optional) For advanced log aggregation if native tools suffice. Currently, Cloud Logging is primary.
