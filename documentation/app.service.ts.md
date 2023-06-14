# AppService

The AppService is an Angular service that provides methods for performing HTTP requests to an API. It encapsulates the functionality for making GET, POST, PUT, and DELETE requests and handles the response data.



## Configuration.

File: [angular-app/src/app/app.service.ts](../angular-app/src/app/app.service.ts)

```typescript
API = {
    url: 'http://localhost:8000', // API base URL
    headers: {
        JSON: {
            'Content-Type': 'application/json' // JSON headers
        },
        form: {
            'Content-Type': 'application/x-www-form-urlencoded' // Form headers
        }
    },
    headerTypes: HeaderTypes, // Available header types
    // Other request methods...
};

```


Component implementation.
```typescript
constructor(public appService: AppService) {
}
```

## Use the provided methods to make HTTP requests.

get: Perform a GET request.
```typescript
appService.API.get(tableName: string, onSuccess?: (result?: any) => void, onError?: (error?: any) => void): Promise<any> => {
// Implementation
}
```

getById: Perform a GET request by ID.
```typescript
appService.API.getById(tableName: string, id: number, onSuccess?: (result?: any) => void, onError?: (error?: any) => void): Promise<any> => {
  // Implementation
}

```

add: Perform a POST request.
```typescript
appService.API.add(tableName: string, data: any, onSuccess?: (result?: any) => void, onError?: (error?: any) => void): Promise<any> => {
  // Implementation
}
```

update: Perform a PUT request.
```typescript
appService.API.update(tableName: string, data: any, onSuccess?: (result?: any) => void, onError?: (error?: any) => void): Promise<any> => {
  // Implementation
}
```

delete: Perform a DELETE request.
```typescript
appService.API.delete(tableName: string, data: any, onSuccess?: (result?: any) => void, onError?: (error?: any) => void): Promise<any> => {
  // Implementation
}
```


## Documentations
- [README.md](../README.md)
- [Angular Deploayment](./angular-deployment.md)
- [example-project Documentation](./example-project.md)
