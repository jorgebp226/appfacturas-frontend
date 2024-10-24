/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getInvoice = /* GraphQL */ `
  query GetInvoice($id: ID!) {
    getInvoice(id: $id) {
      id
      itemName
      totalPrice
      issueDate
      category
      subcategory
      vendor
      invoiceNumber
      uploadDate
      fileType
      originalFile
      status
      userId
      balanceDue
      dueDate
      associatedProject
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const listInvoices = /* GraphQL */ `
  query ListInvoices(
    $filter: ModelInvoiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listInvoices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        itemName
        totalPrice
        issueDate
        category
        subcategory
        vendor
        invoiceNumber
        uploadDate
        fileType
        originalFile
        status
        userId
        balanceDue
        dueDate
        associatedProject
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncInvoices = /* GraphQL */ `
  query SyncInvoices(
    $filter: ModelInvoiceFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncInvoices(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
        id
        itemName
        totalPrice
        issueDate
        category
        subcategory
        vendor
        invoiceNumber
        uploadDate
        fileType
        originalFile
        status
        userId
        balanceDue
        dueDate
        associatedProject
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
export const invoicesByUserId = /* GraphQL */ `
  query InvoicesByUserId(
    $userId: String!
    $sortDirection: ModelSortDirection
    $filter: ModelInvoiceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    invoicesByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        itemName
        totalPrice
        issueDate
        category
        subcategory
        vendor
        invoiceNumber
        uploadDate
        fileType
        originalFile
        status
        userId
        balanceDue
        dueDate
        associatedProject
        createdAt
        updatedAt
        _version
        _deleted
        _lastChangedAt
        __typename
      }
      nextToken
      startedAt
      __typename
    }
  }
`;
