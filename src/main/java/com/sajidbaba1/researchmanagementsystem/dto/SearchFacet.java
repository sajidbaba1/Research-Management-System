package com.sajidbaba1.researchmanagementsystem.dto;

import java.util.List;

public class SearchFacet {
    private String name;
    private List<FacetValue> values;

    public SearchFacet() {}

    public SearchFacet(String name, List<FacetValue> values) {
        this.name = name;
        this.values = values;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<FacetValue> getValues() { return values; }
    public void setValues(List<FacetValue> values) { this.values = values; }

    public static class FacetValue {
        private String value;
        private long count;

        public FacetValue() {}

        public FacetValue(String value, long count) {
            this.value = value;
            this.count = count;
        }

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
