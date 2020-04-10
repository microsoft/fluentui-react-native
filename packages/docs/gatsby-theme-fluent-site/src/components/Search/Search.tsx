import * as React from 'react'
import styled from '@emotion/styled'
import Fuse from 'fuse.js'
import { useKeyPress } from '../../hooks'

const dummyData = [
  {
    title: "Old Man's War",
    author: {
      firstName: 'John',
      lastName: 'Scalzi',
    },
  },
  {
    title: 'The Lock Artist',
    author: {
      firstName: 'Steve',
      lastName: 'Hamilton',
    },
  },
  {
    title: 'HTML5',
    author: {
      firstName: 'Remy',
      lastName: 'Sharp',
    },
  },
  {
    title: 'Right Ho Jeeves',
    author: {
      firstName: 'P.D',
      lastName: 'Woodhouse',
    },
  },
  {
    title: 'The Code of the Wooster',
    author: {
      firstName: 'P.D',
      lastName: 'Woodhouse',
    },
  },
  {
    title: 'Thank You Jeeves',
    author: {
      firstName: 'P.D',
      lastName: 'Woodhouse',
    },
  },
  {
    title: 'The DaVinci Code',
    author: {
      firstName: 'Dan',
      lastName: 'Brown',
    },
  },
  {
    title: 'Angels & Demons',
    author: {
      firstName: 'Dan',
      lastName: 'Brown',
    },
  },
  {
    title: 'The Silmarillion',
    author: {
      firstName: 'J.R.R',
      lastName: 'Tolkien',
    },
  },
  {
    title: 'Syrup',
    author: {
      firstName: 'Max',
      lastName: 'Barry',
    },
  },
  {
    title: 'The Lost Symbol',
    author: {
      firstName: 'Dan',
      lastName: 'Brown',
    },
  },
  {
    title: 'The Book of Lies',
    author: {
      firstName: 'Brad',
      lastName: 'Meltzer',
    },
  },
  {
    title: 'Lamb',
    author: {
      firstName: 'Christopher',
      lastName: 'Moore',
    },
  },
  {
    title: 'Fool',
    author: {
      firstName: 'Christopher',
      lastName: 'Moore',
    },
  },
  {
    title: 'Incompetence',
    author: {
      firstName: 'Rob',
      lastName: 'Grant',
    },
  },
  {
    title: 'Fat',
    author: {
      firstName: 'Rob',
      lastName: 'Grant',
    },
  },
  {
    title: 'Colony',
    author: {
      firstName: 'Rob',
      lastName: 'Grant',
    },
  },
  {
    title: 'Backwards, Red Dwarf',
    author: {
      firstName: 'Rob',
      lastName: 'Grant',
    },
  },
  {
    title: 'The Grand Design',
    author: {
      firstName: 'Stephen',
      lastName: 'Hawking',
    },
  },
  {
    title: 'The Book of Samson',
    author: {
      firstName: 'David',
      lastName: 'Maine',
    },
  },
  {
    title: 'The Preservationist',
    author: {
      firstName: 'David',
      lastName: 'Maine',
    },
  },
  {
    title: 'Fallen',
    author: {
      firstName: 'David',
      lastName: 'Maine',
    },
  },
  {
    title: 'Monster 1959',
    author: {
      firstName: 'David',
      lastName: 'Maine',
    },
  },
]

const options = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['title', 'author.firstName'],
}
const fuse = new Fuse(dummyData, options)

export const Search = () => {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState()

  const [isEmpty, setEmpty] = React.useState(true)
  const [isFocused, setFocus] = React.useState(false)

  const inputRef = React.useRef<any>()

  const handleChange = event => {
    const value = event.target.value
    setQuery(value)
    const results = fuse.search(value)
    setResults(results)
    results && results.length > 0 ? setEmpty(false) : setEmpty(true)
  }

  const handleOnFocus = () => {
    setFocus(true)
  }

  const handleOnBlur = () => {
    setFocus(false)
  }

  const invokeSearch = useKeyPress('/')

  React.useEffect(() => {
    invokeSearch && inputRef.current.focus()
  }, [invokeSearch])

  return (
    <StyledSearch>
      <Input
        ref={inputRef}
        placeholder={isFocused ? '' : 'Search the docs ("/" to focus)'}
        value={query}
        onChange={handleChange}
        onBlur={handleOnBlur}
        onFocus={handleOnFocus}
      />
      {isFocused && (
        <PopOver>
          {isEmpty ? (
            <ResultsViews>
              {query.length > 0 ? (
                <div className="ResultsViews-Empty">Empty state</div>
              ) : (
                <div className="ResultsViews-ZeroQuery">Zero query</div>
              )}
            </ResultsViews>
          ) : (
            <Results>
              <ResultsList>
                {results.map((result: any) => (
                  <ResultsItem>{result.title}</ResultsItem>
                ))}
              </ResultsList>
            </Results>
          )}
        </PopOver>
      )}
    </StyledSearch>
  )
}

const StyledSearch = styled.div`
  position: relative;
  width: 260px;
`

const Input = styled.input`
  padding: 10px;
  margin: 8px 0px 0px;
  height: 32px;
  width: 100%;
  border: 0px none;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.05);
  -moz-appearance: none;
  overflow: hidden;
  font-size: 14px;
`

const PopOver = styled.div`
  position: absolute;
  top: 60px;
  left: 0px;
  padding: 20px;
  height: 300px;
  width: 100%;
  overflow: scroll;

  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 5px;
  box-shadow: 0 20px 30px rgba(100, 100, 100, 0.2);
`

const Results = styled.div`
  display: flex;
`

const ResultsList = styled.ul`
  margin: 0px;
  padding: 0px;
`

const ResultsItem = styled.li`
  padding: 0px;
  margin: 0px 0px 12px;
  list-style: none;
`

const ResultsViews = styled.div`
  display: flex;

  opacity: 0.5;

  .EmptyState-None {
    margin: auto;
  }
`
