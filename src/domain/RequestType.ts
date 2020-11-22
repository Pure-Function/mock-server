export enum RequestType {
  REST = "REST", // CURD operations
  REST_PLURAL = "REST_PLURAL", // READ plural operations
  REST_FETCH = "REST_FETCH", // this is mainly to get things through post
  FILE_DOWNLOAD = "FILE_DOWNLOAD", // File download
  FILE_UPLOAD = "FILE_UPLOAD", // File upload
  CUSTOM = "CUSTOM", // Custom request
  FILE_VIEW = "FILE_VIEW" // View file
}
