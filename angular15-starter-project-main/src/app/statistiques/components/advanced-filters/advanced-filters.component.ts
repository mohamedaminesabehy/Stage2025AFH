import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FiltresStatistiques } from 'src/app/model/statistiques';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss']
})
export class AdvancedFiltersComponent implements OnInit {
  @Input() initialFilters: FiltresStatistiques = {};
  @Output() filtersChange = new EventEmitter<FiltresStatistiques>();
  @Output() resetFilters = new EventEmitter<void>();

  filterForm: FormGroup;
  isExpanded = false;

  // Options pour les sélecteurs
  periodeOptions = [
    { value: '7j', label: '7 derniers jours' },
    { value: '30j', label: '30 derniers jours' },
    { value: '3m', label: '3 derniers mois' },
    { value: '6m', label: '6 derniers mois' },
    { value: '1a', label: '1 an' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  typesMarche = [
    { value: 1, label: 'DECOMPTE' },
    { value: 2, label: 'CONSULTATION' },
    { value: 3, label: 'TRAVAUX' },
    { value: 4, label: 'FOURNITURES' }
  ];

  structures = [
    { value: 'STR001', label: 'إدارة العملية لتونس' },
    { value: 'STR002', label: 'مصلحة الأشغال 6 ببن عروس' },
    { value: 'STR003', label: 'الإدارة العملية بسوسة' },
    { value: 'STR004', label: 'الإدارة العملية بصفاقس' }
  ];

  regions = [
    { value: 'tunis', label: 'Tunis' },
    { value: 'sfax', label: 'Sfax' },
    { value: 'sousse', label: 'Sousse' },
    { value: 'ariana', label: 'Ariana' },
    { value: 'autres', label: 'Autres' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      periode: ['30j'],
      dateDebut: [null],
      dateFin: [null],
      fournisseurs: [[]],
      typesMarche: [[]],
      structures: [[]],
      regions: [[]],
      montantMin: [null],
      montantMax: [null],
      recherche: ['']
    });
  }

  ngOnInit(): void {
    // Initialiser le formulaire avec les filtres existants
    if (this.initialFilters) {
      this.filterForm.patchValue(this.initialFilters);
    }

    // Écouter les changements du formulaire
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(values => {
        this.onFiltersChange(values);
      });

    // Gérer le changement de période
    this.filterForm.get('periode')?.valueChanges.subscribe(periode => {
      this.onPeriodeChange(periode);
    });
  }

  onPeriodeChange(periode: string): void {
    const now = new Date();
    let dateDebut: Date | null = null;

    switch (periode) {
      case '7j':
        dateDebut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30j':
        dateDebut = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        dateDebut = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        dateDebut = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1a':
        dateDebut = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        // Ne pas modifier les dates pour la période personnalisée
        return;
    }

    if (dateDebut && periode !== 'custom') {
      this.filterForm.patchValue({
        dateDebut: dateDebut,
        dateFin: now
      }, { emitEvent: false });
    }
  }

  onFiltersChange(values: any): void {
    const filters: FiltresStatistiques = {
      dateDebut: values.dateDebut,
      dateFin: values.dateFin,
      fournisseurs: values.fournisseurs?.length > 0 ? values.fournisseurs : undefined,
      typesMarche: values.typesMarche?.length > 0 ? values.typesMarche : undefined,
      structures: values.structures?.length > 0 ? values.structures : undefined,
      regions: values.regions?.length > 0 ? values.regions : undefined,
      montantMin: values.montantMin || undefined,
      montantMax: values.montantMax || undefined
    };

    this.filtersChange.emit(filters);
  }

  onReset(): void {
    this.filterForm.reset({
      periode: '30j',
      dateDebut: null,
      dateFin: null,
      fournisseurs: [],
      typesMarche: [],
      structures: [],
      regions: [],
      montantMin: null,
      montantMax: null,
      recherche: ''
    });

    this.resetFilters.emit();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  exportFilters(): void {
    const filters = this.filterForm.value;
    const dataStr = JSON.stringify(filters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `filtres-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  importFilters(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const filters = JSON.parse(e.target?.result as string);
          this.filterForm.patchValue(filters);
        } catch (error) {
          console.error('Erreur lors de l\'import des filtres:', error);
        }
      };
      reader.readAsText(file);
    }
  }

  getActiveFiltersCount(): number {
    const values = this.filterForm.value;
    let count = 0;

    if (values.fournisseurs?.length > 0) count++;
    if (values.typesMarche?.length > 0) count++;
    if (values.structures?.length > 0) count++;
    if (values.regions?.length > 0) count++;
    if (values.montantMin) count++;
    if (values.montantMax) count++;
    if (values.recherche?.trim()) count++;

    return count;
  }

  hasCustomDateRange(): boolean {
    return this.filterForm.get('periode')?.value === 'custom';
  }
}
