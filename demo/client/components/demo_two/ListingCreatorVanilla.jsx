import React, { useState, useEffect } from 'react';
import gql from './gqlQueries';

const ListingCreatorVanilla = ({ setListings, listings }) => {
  const [listingsCount, setListingsCount] = useState(0);
  const [authors, setAuthors] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // combo of componentDidMount and componentDidUpdate
  useEffect(() => {
    if (initialized) {
      // waits till loading complete to set correct length
      setListingsCount(listings.length);
    }
  });
  // creates flag to ensure useEffect does not perpetually fetch listings

  useEffect(() => {
    // condition for intial loading of listings - similiar to compdidMount
    // without this initialized check useEffect will also act like compDidUpdate
    if (!initialized) {
      //! props.getListingsQuery.loading &&
      gql.getListings().then(res => {
        setListingsCount(res.data.listings.length);
      });
      gql.getAuthors().then(res => {
        setAuthors(res.data.authors);
      });

      // console.log('this should only be called when page refreshes');
      setInitialized(true);
    }
  });
  // set initial state for query inputs
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  // input validation
  const [titleError, setTitleError] = useState('❌');
  const [authorError, setAuthorError] = useState('❌');

  useEffect(() => {
    if (!title) {
      setTitleError('❌');
    }
    if (!authorId || authorId === 'Select Author') {
      setAuthorError('❌');
    }
  });

  const addListing = e => {
    e.preventDefault();
    // TODO: send data to db w/ author_id
    if (title) {
      if (authorId) {
        // passed in from queries module
        // call to add item to db -> hits endpoint which holds schema -> once called, that sends to db
        gql
          .addListing(title, authorId)
          .then(res => {
            const addedListing = res.data.addListing;
            setListings(listing =>
              listing.concat({
                id: addedListing.id,
                title: addedListing.title,
                author: addedListing.author,
              }),
            );
            setTitle('');
            setAuthorId('');
          })
          .catch(err => {
            throw err;
          });
      }
    }
  };

  const displayAuthors = () => {
    return authors.map(author => (
      // jsx / html issue
      // option tag can only take one value attribute
      <option key={author.id} value={author.id}>
        {author.name}
      </option>
    ));
  };

  return (
    <div className="listing-creator">
      <div className="creator-tools">
        <div>
          <h3>Total Listings:</h3> <span>Total Count: {listingsCount}</span>
        </div>
        <form onSubmit={addListing}>
          <div className="field">
            <label>Title: </label>
            <input
              type="text"
              name="title"
              placeholder="Enter Title"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setTitleError('✅');
              }}
            />
            <span>{titleError}</span>
          </div>

          <div className="field">
            <label>Author: </label>
            <select
              value={authorId}
              onChange={e => {
                setAuthorId(e.target.value);
                setAuthorError('✅');
              }}
            >
              <option>Select Author</option>
              {displayAuthors()}
            </select>
            <span>{authorError}</span>
          </div>

          <input type="submit" value="+" />
        </form>
      </div>
    </div>
  );
};

export default ListingCreatorVanilla;
