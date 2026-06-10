import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentsService } from './documents/documents.service';

const seedDocuments = [
  // Topic 1: SQL vs NoSQL Databases
  {
    title: 'SQL Fundamentals',
    topic: 'SQL vs NoSQL Databases',
    content: `SQL (Structured Query Language) is a standardized programming language used for managing relational databases. SQL databases follow a structured schema with predefined tables, columns, and relationships. They use ACID properties (Atomicity, Consistency, Isolation, Durability) to ensure data integrity.

Key characteristics of SQL databases:
- Structured data with fixed schemas
- Strong data consistency guarantees
- Support for complex joins and transactions
- Vertical scaling capabilities
- Best suited for applications requiring complex queries and strict consistency

Popular SQL databases include MySQL, PostgreSQL, Oracle, and Microsoft SQL Server. SQL excels in financial systems, inventory management, and any application where data accuracy is critical.`,
  },
  {
    title: 'NoSQL Database Types',
    topic: 'SQL vs NoSQL Databases',
    content: `NoSQL (Not Only SQL) databases provide a mechanism for storage and retrieval of data modeled in means other than the tabular relations used in relational databases. NoSQL databases are designed to scale horizontally and handle unstructured or semi-structured data.

Types of NoSQL databases:
1. Document Stores (MongoDB, CouchDB) - Store data as JSON-like documents
2. Key-Value Stores (Redis, DynamoDB) - Simple key-value pairs for fast lookups
3. Wide-Column Stores (Cassandra, HBase) - Column-oriented storage for large datasets
4. Graph Databases (Neo4j) - Store relationships as first-class entities

NoSQL databases offer flexible schemas, horizontal scalability, and high availability. They are ideal for big data applications, real-time analytics, and content management systems.`,
  },
  {
    title: 'When to Choose SQL vs NoSQL',
    topic: 'SQL vs NoSQL Databases',
    content: `Choosing between SQL and NoSQL depends on your specific requirements:

Choose SQL when:
- Data relationships are complex and well-defined
- ACID compliance is mandatory (banking, healthcare)
- You need complex join operations
- Data structure is stable and unlikely to change
- Vertical scaling is sufficient for your needs

Choose NoSQL when:
- Rapid development with evolving schemas is needed
- Massive scale requires horizontal scaling
- Data is unstructured or semi-structured
- High write throughput is required
- Eventual consistency is acceptable

Hybrid approaches are also common, using SQL for transactional data and NoSQL for analytics or caching layers.`,
  },

  // Topic 2: REST API vs GraphQL
  {
    title: 'REST API Architecture',
    topic: 'REST API vs GraphQL',
    content: `REST (Representational State Transfer) is an architectural style for designing networked applications. REST APIs use standard HTTP methods (GET, POST, PUT, DELETE) to interact with resources identified by URLs.

Key principles of REST:
- Stateless communication between client and server
- Cacheable responses to improve performance
- Uniform interface with standard HTTP methods
- Resource-based architecture
- Layered system allowing intermediaries

Advantages of REST:
- Simple and widely understood
- Excellent tooling and browser support
- Stateless nature makes it highly scalable
- Caching is straightforward with HTTP headers

REST is ideal for public APIs, microservices communication, and when clients have varying data needs.`,
  },
  {
    title: 'GraphQL Query Language',
    topic: 'REST API vs GraphQL',
    content: `GraphQL is a query language and runtime for APIs developed by Facebook. It allows clients to request exactly the data they need, reducing over-fetching and under-fetching common in REST APIs.

Key features of GraphQL:
- Single endpoint for all queries and mutations
- Strongly typed schema with introspection
- Clients specify exact fields needed
- Real-time subscriptions for live data
- Batched requests to reduce network overhead

Advantages of GraphQL:
- Precise data fetching reduces bandwidth
- Self-documenting through schema introspection
- Strong typing catches errors early
- Excellent for mobile applications with limited bandwidth
- Frontend teams can work independently

GraphQL shines in complex domains with many entities and relationships.`,
  },
  {
    title: 'Comparing REST and GraphQL Trade-offs',
    topic: 'REST API vs GraphQL',
    content: `Both REST and GraphQL have their strengths and ideal use cases:

REST advantages:
- Simpler caching at HTTP level
- Better for file uploads and binary data
- Mature ecosystem with extensive tooling
- Easier to implement rate limiting
- Stateless by design

GraphQL advantages:
- Eliminates over-fetching and under-fetching
- Single request for complex data requirements
- Strong typing and validation
- Better developer experience with GraphiQL
- Easier evolution of APIs without versioning

Considerations:
- GraphQL requires more upfront schema design
- REST caching is more straightforward
- GraphQL query complexity can impact performance
- REST is better for simple CRUD operations

Many organizations use both: REST for simple services, GraphQL for complex data aggregation.`,
  },

  // Topic 3: Monolithic vs Microservices
  {
    title: 'Monolithic Architecture',
    topic: 'Monolithic vs Microservices Architecture',
    content: `Monolithic architecture is a traditional approach where all components of an application are built as a single unit. The entire application is deployed together as one codebase.

Characteristics of monolithic architecture:
- Single codebase for all functionality
- Shared database for all modules
- Tightly coupled components
- Deployed as a single artifact
- Simple to develop and test initially

Advantages:
- Easier to develop and debug
- Simpler deployment process
- Better performance with in-process communication
- Straightforward testing and integration
- Lower operational complexity

When to use monolithic:
- Small teams and simple applications
- Rapid prototyping and MVPs
- When time to market is critical
- Limited operational expertise
- Low scaling requirements`,
  },
  {
    title: 'Microservices Architecture',
    topic: 'Monolithic vs Microservices Architecture',
    content: `Microservices architecture structures an application as a collection of loosely coupled, independently deployable services. Each service is responsible for a specific business capability.

Key principles of microservices:
- Single Responsibility Principle per service
- Independent deployment and scaling
- Service isolation and fault tolerance
- API-based communication between services
- Decentralized data management

Advantages:
- Independent scaling of services
- Technology diversity per service
- Team autonomy and parallel development
- Better fault isolation
- Easier maintenance of individual services

Challenges:
- Distributed system complexity
- Network latency between services
- Data consistency across services
- Increased operational overhead
- Need for robust monitoring and logging

Best suited for large, complex applications with multiple teams.`,
  },
  {
    title: 'Migration Strategies from Monolith to Microservices',
    topic: 'Monolithic vs Microservices Architecture',
    content: `Migrating from monolith to microservices requires careful planning:

Strategies:
1. Strangler Fig Pattern - Gradually replace monolith functionality
2. Anti-Corruption Layer - Isolate new services from legacy code
3. Database per Service - Split data ownership gradually
4. Event-Driven Architecture - Use events to decouple services

Common pitfalls:
- Premature decomposition into too many services
- Distributed monolith (tightly coupled microservices)
- Ignoring data consistency challenges
- Underestimating operational complexity
- Insufficient monitoring and observability

Best practices:
- Start with coarse-grained services
- Use domain-driven design to identify boundaries
- Implement comprehensive monitoring first
- Maintain backward compatibility during transition
- Consider a service mesh for cross-cutting concerns

The decision should be driven by organizational needs, not just technical trends.`,
  },

  // Topic 4: SSR vs CSR
  {
    title: 'Server-Side Rendering (SSR)',
    topic: 'SSR vs CSR',
    content: `Server-Side Rendering generates HTML on the server for each request. The server processes the application and sends fully rendered HTML to the client.

Benefits of SSR:
- Faster initial page load with visible content immediately
- Better SEO as search engines can crawl rendered content
- Improved performance on slow devices
- Consistent experience for all users
- Reduced client-side JavaScript bundle size

How SSR works in Next.js:
- Server executes React components
- Fetches data during rendering
- Generates complete HTML
- Sends HTML + minimal JavaScript
- Hydrates to become interactive

Use cases for SSR:
- Content-heavy websites (blogs, news, e-commerce)
- SEO-critical applications
- First-time visitors who need fast initial load
- Users with limited device capabilities
- Public-facing marketing pages`,
  },
  {
    title: 'Client-Side Rendering (CSR)',
    topic: 'SSR vs CSR',
    content: `Client-Side Rendering loads a minimal HTML shell and uses JavaScript to render content in the browser. The application logic runs entirely on the client.

Benefits of CSR:
- Rich interactive user experiences
- Reduced server load after initial page load
- Smooth transitions between pages
- Offline capabilities with service workers
- Can feel like native applications

How CSR works:
- Browser loads HTML skeleton
- Downloads JavaScript bundle
- Executes React/Vue/Angular application
- Fetches data from APIs
- Renders content dynamically

Use cases for CSR:
- Dashboards and admin interfaces
- Applications requiring real-time updates
- Interactive tools and editors
- Single Page Applications (SPAs)
- User-authenticated applications

Popular frameworks: React, Vue.js, Angular with client-side routing.`,
  },
  {
    title: 'Hybrid Rendering Approaches',
    topic: 'SSR vs CSR',
    content: `Modern frameworks like Next.js offer hybrid rendering strategies:

Static Site Generation (SSG):
- Pages built at compile time
- Served from CDN for maximum speed
- Best for content that rarely changes
- Revalidate option for updates

Server-Side Rendering (SSR):
- Rendered on each request
- Fresh data for dynamic content
- Balances SEO and interactivity

Client-Side Rendering (CSR):
- Full browser execution
- Maximum interactivity
- API-driven data fetching

Incremental Static Regeneration (ISR):
- Static pages updated automatically
- Background regeneration
- Combines speed of static with freshness of SSR

Choosing the right approach:
- Marketing pages: SSG or SSR
- User dashboards: CSR with SSR for initial load
- E-commerce: SSR for product pages, CSR for cart
- API-heavy apps: CSR with skeleton loading states`,
  },

  // Topic 5: WebSockets vs HTTP Polling
  {
    title: 'HTTP Polling Techniques',
    topic: 'WebSockets vs HTTP Polling',
    content: `HTTP Polling involves the client repeatedly making HTTP requests to check for updates from the server.

Types of polling:
1. Short Polling - Fixed interval requests (e.g., every 5 seconds)
2. Long Polling - Connection stays open until data arrives
3. Streaming - Server keeps connection open for continuous data

Advantages of polling:
- Works with standard HTTP infrastructure
- Simple to implement and debug
- Compatible with all browsers
- Works through corporate firewalls
- No special server requirements

Disadvantages:
- High overhead from repeated connections
- Latency between updates
- Wasted requests when no data changes
- Server load increases with more clients
- Not efficient for high-frequency updates

Best for: Infrequent updates, simple applications, environments with strict proxy/firewall rules.`,
  },
  {
    title: 'WebSocket Protocol',
    topic: 'WebSockets vs HTTP Polling',
    content: `WebSockets provide full-duplex, bidirectional communication over a single, long-lived TCP connection. After an initial HTTP handshake, the connection upgrades to WebSocket protocol.

Key features:
- Persistent connection between client and server
- Low latency two-way communication
- Binary and text message support
- Frame-based protocol with minimal overhead
- Built-in ping/pong for keepalive

Advantages:
- Real-time bidirectional communication
- Lower latency than polling
- Reduced server load for high-frequency updates
- Efficient bandwidth usage
- Support for binary data

Implementation considerations:
- Requires WebSocket server support
- Connection management (reconnect logic)
- Horizontal scaling with Redis/pub-sub
- Security (wss:// for encryption)
- Fallback strategies for unsupported clients

Ideal for: Chat applications, live feeds, gaming, collaborative tools, financial tickers.`,
  },
  {
    title: 'Choosing Between Polling and WebSockets',
    topic: 'WebSockets vs HTTP Polling',
    content: `The choice depends on your real-time requirements:

Use HTTP Polling when:
- Updates are infrequent (every 30+ seconds)
- Infrastructure must use standard HTTP only
- Simplicity is prioritized over efficiency
- Server resources are limited for persistent connections
- Network conditions are unreliable

Use WebSockets when:
- Sub-second latency is required
- High-frequency updates are common
- Bidirectional communication is needed
- Server push is essential
- Bandwidth efficiency matters

Hybrid approaches:
- Start with polling, upgrade to WebSockets when supported
- Use Server-Sent Events (SSE) for server-to-client only
- Implement connection pooling for high-traffic scenarios

Performance comparison:
- Polling: Higher latency, more bandwidth overhead
- WebSockets: Lower latency, efficient for continuous data
- SSE: Middle ground for unidirectional updates

Consider using libraries like Socket.io that abstract these choices and provide fallbacks automatically.`,
  },
];

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const documentsService = app.get(DocumentsService);

  console.log('Starting database seed...');

  // Check existing documents
  const existingCount = await documentsService.getDocumentCount();
  console.log(`Found ${existingCount} existing documents`);

  if (existingCount > 0) {
    console.log('Database already seeded. Skipping...');
    await app.close();
    process.exit(0);
  }

  // Seed documents
  for (const doc of seedDocuments) {
    try {
      await documentsService.createResearchDocument(doc);
      console.log(`Created: ${doc.title} (${doc.topic})`);
    } catch (error) {
      console.error(`Failed to create ${doc.title}:`, error.message);
    }
  }

  console.log(`\nSeeded ${seedDocuments.length} documents successfully!`);
  await app.close();
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
