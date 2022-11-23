const generateMessage = (from, text) => {
  return {
    from,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessage = (from, url) => {
  return {
    from,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage,
};
