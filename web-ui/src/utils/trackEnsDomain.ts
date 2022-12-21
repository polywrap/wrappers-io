import axios from "axios";

export const trackEnsDomain = async (domain: string): Promise<void> => {
  console.log("TRACKING: " + domain);
  await axios
    .post(`${ENS_DOMAIN_TRACKING_ENDPOINT}/add`, [domain], {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .catch((err: any) => {
      console.error("TRACKING ERROR: " + domain, err);
    });
};
