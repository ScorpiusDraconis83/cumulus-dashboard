const fs = require('fs-extra');
const path = require('path');

const collectionsJson = require('../fake-api-fixtures/collections/index.json');
const collectionsFilePath = path.join(__dirname, 'db-collections.json');

const providersJson = require('../fake-api-fixtures/providers/index.json');
const providersFilePath = path.join(__dirname, 'db-providers.json');

const rulesJson = require('../fake-api-fixtures/rules/index.json');
const rulesFilePath = path.join(__dirname, 'db-rules.json');

const seed = (filePath, data) => fs.outputJson(filePath, data);
const resetState = () => {
  return Promise.all([
    seed(collectionsFilePath, collectionsJson),
    seed(providersFilePath, providersJson),
    seed(rulesFilePath, rulesJson)
  ]);
};

class FakeDb {
  constructor (filePath) {
    this.filePath = filePath;
  }

  addItem (record) {
    return fs.readJson(this.filePath)
      .then((data) => {
        data.meta.count += 1;
        data.results.push(record);
        return data;
      })
      .then((data) => seed(this.filePath, data));
  }

  getItems () {
    return fs.readJson(this.filePath);
  }
}

class FakeRulesDb extends FakeDb {
  deleteItem (name) {
    return fs.readJson(this.filePath)
      .then((data) => {
        data.meta.count -= 1;
        data.results = data.results.filter(rule => rule.name !== name);
        return data;
      })
      .then((data) => seed(this.filePath, data));
  }
}
const fakeRulesDb = new FakeRulesDb(rulesFilePath);

class FakeCollectionsDb extends FakeDb {
  getItem (name, version) {
    return fs.readJson(this.filePath)
      .then((data) => {
        const collection = data.results.filter(
          collection => `${collection.name}${collection.version}` === `${name}${version}`
        );
        return collection.length > 0 ? collection[0] : null;
      });
  }

  deleteItem (name, version) {
    return fs.readJson(this.filePath)
      .then((data) => {
        data.meta.count -= 1;
        data.results = data.results.filter(
          collection => `${collection.name}${collection.version}` !== `${name}${version}`
        );
        return data;
      })
      .then((data) => seed(this.filePath, data));
  }

  async updateItem (name, version, updates) {
    const data = await fs.readJson(this.filePath);
    let updatedItem;
    data.results.forEach((collection, index) => {
      if (`${collection.name}${collection.version}` === `${name}${version}`) {
        data.results[index] = updates;
        updatedItem = data.results[index];
      }
    });
    await seed(this.filePath, data);
    return updatedItem;
  }
}
const fakeCollectionsDb = new FakeCollectionsDb(collectionsFilePath);

class FakeProvidersDb extends FakeDb {
  getItem (id) {
    return fs.readJson(this.filePath)
      .then((data) => {
        const provider = data.results.filter(provider => provider.id === id);
        return provider.length > 0 ? provider[0] : null;
      });
  }

  deleteItem (id) {
    return fs.readJson(this.filePath)
      .then((data) => {
        data.meta.count -= 1;
        data.results = data.results.filter(provider => provider.id !== id);
        return data;
      })
      .then((data) => seed(this.filePath, data));
  }

  async updateItem (id, updates) {
    const data = await fs.readJson(this.filePath);
    let updatedItem;
    data.results.forEach((provider, index) => {
      if (provider.id === id) {
        data.results[index] = Object.assign({}, data.results[index], updates);
        updatedItem = data.results[index];
      }
    });
    await seed(this.filePath, data);
    return updatedItem;
  }
}
const fakeProvidersDb = new FakeProvidersDb(providersFilePath);

module.exports.resetState = resetState;
module.exports.fakeCollectionsDb = fakeCollectionsDb;
module.exports.fakeProvidersDb = fakeProvidersDb;
module.exports.fakeRulesDb = fakeRulesDb;
