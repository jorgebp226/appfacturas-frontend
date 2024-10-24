/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateInvoice = /* GraphQL */ `
  subscription OnCreateInvoice(
    $filter: ModelSubscriptionInvoiceFilterInput
    $userId: String
  ) {
    onCreateInvoice(filter: $filter, userId: $userId) {
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
export const onUpdateInvoice = /* GraphQL */ `
  subscription OnUpdateInvoice(
    $filter: ModelSubscriptionInvoiceFilterInput
    $userId: String
  ) {
    onUpdateInvoice(filter: $filter, userId: $userId) {
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
export const onDeleteInvoice = /* GraphQL */ `
  subscription OnDeleteInvoice(
    $filter: ModelSubscriptionInvoiceFilterInput
    $userId: String
  ) {
    onDeleteInvoice(filter: $filter, userId: $userId) {
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
