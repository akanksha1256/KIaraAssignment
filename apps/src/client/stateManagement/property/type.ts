import { FetchStateWithError } from "../../helpers/type";

export interface Property {
  id: string;
  name: string;
  address: string;
}

export type PropertyState = {
  propertyListfetchState: FetchStateWithError;
  propertiesList: Property[];
};
