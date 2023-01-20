
import axios from 'axios';
const {config} = require('./config');
// const axios = require('axios');

// droplet
const axiosInstance = axios.create({
  baseURL: 'https://benhub.io/analytics',
});


const postVisit = (path, map) => {
  if (config.isLocalHost) return;

  const isUnique = !!!localStorage.getItem('isRevisit');
  localStorage.setItem('isRevisit', true);
  return axiosInstance
    .post('/visit', {
      hostname: getHostname(), path, isUnique, map,
    })
};


const getHostname = () => {
  return window.location.hostname;
}

export default postVisit;
