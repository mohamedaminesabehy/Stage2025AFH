package com.afh.gescomp.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Objects;

@Getter
@Setter
public class PageRequestDto {
    private Integer pageNo = 0;
    private Integer pageSize = 10;
    private Sort.Direction sort = Sort.Direction.ASC;

    private String sortByColumn = "id";

    public Pageable getPageable(PageRequestDto dto){
        Integer page = (dto.getPageNo() != null) ? dto.getPageNo() : this.pageNo;
        Integer size = (dto.getPageSize() != null) ? dto.getPageSize() : this.pageSize;
        Sort.Direction sort = (dto.getSort() != null) ? dto.getSort() : this.sort;
        String sortByColumn = (dto.getSortByColumn() != null) ? dto.getSortByColumn() : this.sortByColumn;

        //        PageRequest request = PageRequest.of(page, size);
        new PageRequest(page, size,sort,sortByColumn);
        PageRequest request = new PageRequest(page, size,sort,sortByColumn);
        return request;
    }
}
