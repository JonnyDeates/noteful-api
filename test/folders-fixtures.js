function makeFoldersArray() {
  return [
    {
      id: 1,
      name: 'Thinkful',
    },
    {
      id: 2,
      name: 'Google',
    },
    {
      id: 3,
      name: 'MDN',
    },
  ]
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
  };
  const expectedFolder = {
    ...maliciousFolder,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousFolder,
    expectedFolder,
  }
}

module.exports = {
  makeFoldersArray,
  makeMaliciousFolder,
};