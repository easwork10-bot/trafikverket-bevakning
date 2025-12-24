import { saveMetadata } from "./src/services/metadataWriter.js";

await saveMetadata({
  licences: [
    { id: "B", trafikverketId: 23, name: "B – Car" }
  ],
  examTypes: [
    { id: "driving", trafikverketId: 2, name: "Driving test" }
  ],
  locations: [
    { id: "stockholm-farsta", trafikverketId: 101, name: "Farsta" }
  ]
});

console.log("Metadata write test finished");
