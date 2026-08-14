export type MockClient = {
  id: string;
  firstName: string;
  lastName: string;
  partnerFirstName: string;
  partnerLastName: string;
  email: string;
  phone: string;
  weddingDate: string;
  weddingLocation: string;
};

export const mockClient: MockClient = {
  id: "client1",
  firstName: "Salma",
  lastName: "Benali",
  partnerFirstName: "Yassine",
  partnerLastName: "Benali",
  email: "salma.benali@email.com",
  phone: "06 12 34 56 78",
  weddingDate: "2025-06-15",
  weddingLocation: "Sousse",
};
