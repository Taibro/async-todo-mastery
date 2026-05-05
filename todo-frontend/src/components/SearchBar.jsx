function SearchBar({value, onChange}){
    return (
        <div className="search-bar">
            <input
                type='text'
                placeholder="Tim kiem todo... "
                value={value}

                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;