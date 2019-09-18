import axios from 'axios';

const getForm = (url) => {
  return axios.get(
    url,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
    .then(response => response.data)
    .catch((response) => {
      throw response;
    });
};

export default getForm;
