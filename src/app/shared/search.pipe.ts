import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'search'
})


export class SearchPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        // console.log("PIPE items: " + JSON.stringify(items))
        
        if (!items) return [];
        if (!searchText) return items;

        searchText = searchText.toLowerCase()
        return items.filter(it => {

            return it.title.toLowerCase().includes(searchText) || it.reporter.toLowerCase().includes(searchText) || it.status.toLowerCase().includes(searchText)
        })
    }
}