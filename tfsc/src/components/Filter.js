import React, { useState } from 'react';
import { RadioGroup, Radio, InputGroup } from '@blueprintjs/core';
// import PropTypes from 'prop-types';

import FilterBy from './FilterBy';

import { FILTERS } from '../constants';

const Filter = ({ tab, children, actionComponent }) => {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [content, setContent] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [dataForFilter, setDataForFilter] = useState([]);

  const data = {};
  if (dataForFilter) {
    FILTERS[tab].filterBy.forEach((field) => {
      data[field] = dataForFilter.map(i => i[field]);
    });
  }

  const childrenWithProps = React.Children.map(children, child => React.cloneElement(child, {
    content,
    setContent,
    filter,
    search,
    dataForFilter,
    setDataForFilter,
    filterOptions
  }));

  return content ? (
    childrenWithProps
  ) : (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header dashboard-header">
        <div className="dashboard-header-col-3">
          <RadioGroup
            inline
            selectedValue={filter}
            onChange={({ target }) => {
              setFilter(target.value);
            }}
            className="dashboard-panel-header-radiogroup"
          >
            <Radio label="All" value={''} className="radio-button" />
            {FILTERS[tab].statuses.map(s => (
              <Radio key={s} label={s} value={s} className="radio-button" />
            ))}
          </RadioGroup>
        </div>
        <div className="dashboard-header-col-2">
          <InputGroup
            large
            placeholder="Search"
            value={search}
            className="search-input"
            onChange={({ target }) => {
              setSearch(target.value);
            }}
          />
        </div>
        <div className="dashboard-header-col-btn">{actionComponent || <></>}</div>
      </div>
      <div className="dashboard-panel-body layout-container">
        <aside className="layout-aside">
          <h4>Filter by</h4>
          {FILTERS[tab].filterBy.map((f, i) => (
            <div key={i} className="filter-select-wrap">
              <FilterBy
                type={f}
                data={data[f]}
                setFilter={(filterItem) => {
                  const newState = Object.assign({}, filterOptions);
                  if (typeof filterItem === 'object') {
                    newState[f] = Object.assign({}, newState[f], filterItem);
                  } else {
                    newState[f] = filterItem;
                  }
                  setFilterOptions(newState);
                }}
              />
            </div>
          ))}
        </aside>
        <main className="layout-main">{childrenWithProps}</main>
      </div>
    </div>
  );
};

export default Filter;
