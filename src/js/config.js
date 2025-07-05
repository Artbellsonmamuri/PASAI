export const API = {
  lens: {
    token:  process.env.LENS_TOKEN || 'NHaWYJh7KXwYbJt4mNSPGvfMMYGPW3z1n8jXLh2FIvm39WgQjnUH
',
    url:    'https://api.lens.org/patent/search'
  },
  google: {
    key:    process.env.GOOGLE_API_KEY || 'AIzaSyCxt5t_PCZpgPL-c08idLcWcu3-SFoVkwc',
    cx:     process.env.GOOGLE_CX || 'e5fd499e13faf45be',
    url:    'https://www.googleapis.com/customsearch/v1'
  }
};
