import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { StatistiquesPeriodesComponent } from './statistiques-periodes.component';
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';
import { ArticleService } from '../../../services/article/article.service';
import { MarcheService } from '../../../services/marche/marche.service';
import { StatistiquesCompletesService } from '../../../services/statistiques-completes/statistiques-completes.service';
import { StatistiquesService } from '../../../services/statistiques/statistiques.service';

describe('StatistiquesPeriodesComponent', () => {
  let component: StatistiquesPeriodesComponent;
  let fixture: ComponentFixture<StatistiquesPeriodesComponent>;
  let statistiquesService: jasmine.SpyObj<StatistiquesService>;
  let statistiquesCompletesService: jasmine.SpyObj<StatistiquesCompletesService>;

  beforeEach(async () => {
    const statistiquesServiceSpy = jasmine.createSpyObj('StatistiquesService', [
      'getMarchesEvolutionPeriode',
      'getMarchesEvolutionParDates',
      'getFournisseursRepartitionPeriode',
      'getFournisseursRepartitionParDates',
      'getRegionsRepartitionPeriode',
      'getRegionsRepartitionParDates',
      'getArticlesRepartitionPeriode',
      'getArticlesRepartitionParDates',
      'getMetriquesClés',
      'getTendancesMetriques',
      'getMarchesDetailles',
      'getFournisseursAvecMarches'
    ]);

    const statistiquesCompletesServiceSpy = jasmine.createSpyObj('StatistiquesCompletesService', [
      'getToutesStatistiques'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ StatistiquesPeriodesComponent ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: StatistiquesService, useValue: statistiquesServiceSpy },
        { provide: StatistiquesCompletesService, useValue: statistiquesCompletesServiceSpy },
        { provide: FournisseurService, useValue: {} },
        { provide: ArticleService, useValue: {} },
        { provide: MarcheService, useValue: {} }
      ]
    })
    .compileComponents();

    statistiquesService = TestBed.inject(StatistiquesService) as jasmine.SpyObj<StatistiquesService>;
    statistiquesCompletesService = TestBed.inject(StatistiquesCompletesService) as jasmine.SpyObj<StatistiquesCompletesService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatistiquesPeriodesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null dates by default', () => {
    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('should load real data from database on init', () => {
    // Mock des réponses des services
    statistiquesService.getMetriquesClés.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));
    statistiquesService.getMarchesEvolutionPeriode.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));
    statistiquesService.getFournisseursRepartitionPeriode.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));
    statistiquesService.getRegionsRepartitionPeriode.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));
    statistiquesService.getArticlesRepartitionPeriode.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));
    statistiquesCompletesService.getToutesStatistiques.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

    component.ngOnInit();

    expect(statistiquesService.getMetriquesClés).toHaveBeenCalled();
    expect(statistiquesService.getMarchesEvolutionPeriode).toHaveBeenCalledWith('12months', '03');
  });

  it('should load marches evolution data with 12 months by default when no dates selected', () => {
    component.startDate = null;
    component.endDate = null;
    component.selectedPeriod = 'custom';

    statistiquesService.getMarchesEvolutionPeriode.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

    component['loadMarchesEvolutionData']();

    expect(statistiquesService.getMarchesEvolutionPeriode).toHaveBeenCalledWith('12months', '03');
  });

  it('should load marches evolution data with custom dates when dates are selected', () => {
    component.startDate = new Date('2023-01-01');
    component.endDate = new Date('2023-12-31');
    component.selectedPeriod = 'custom';

    statistiquesService.getMarchesEvolutionParDates.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

    component['loadMarchesEvolutionData']();

    expect(statistiquesService.getMarchesEvolutionParDates).toHaveBeenCalledWith('2023-01-01', '2023-12-31', '03');
  });

  it('should get correct period label for default period', () => {
    component.selectedPeriod = '12months';
    const label = component.getPeriodLabel();
    expect(label).toBe('les 12 derniers mois');
  });

  it('should get correct period label for custom period with dates', () => {
    component.selectedPeriod = 'custom';
    component.startDate = new Date('2023-01-01');
    component.endDate = new Date('2023-12-31');
    const label = component.getPeriodLabel();
    expect(label).toContain('du 01/01/2023 au 31/12/2023');
  });

  it('should get default period label when no dates selected', () => {
    component.selectedPeriod = 'custom';
    component.startDate = null;
    component.endDate = null;
    const label = component.getPeriodLabel();
    expect(label).toBe('les 12 derniers mois (par défaut)');
  });

  it('should handle start date change correctly', () => {
    const testDate = '2023-01-01';
    component.onStartDateChange(testDate);
    expect(component.startDate).toEqual(new Date(testDate));
  });

  it('should handle end date change correctly', () => {
    const testDate = '2023-12-31';
    component.onEndDateChange(testDate);
    expect(component.endDate).toEqual(new Date(testDate));
  });

  it('should handle null date changes', () => {
    component.onStartDateChange(null);
    component.onEndDateChange(null);
    expect(component.startDate).toBeNull();
    expect(component.endDate).toBeNull();
  });

  it('should update marches evolution chart with valid data', () => {
    const mockData = {
      labels: ['Jan 2023', 'Fév 2023', 'Mar 2023'],
      data: [5, 8, 12]
    };

    component.updateMarchesEvolutionChart(mockData);

    expect(component.marcheEvolutionChart.labels).toEqual(mockData.labels);
    expect(component.marcheEvolutionChart.datasets[0].data).toEqual(mockData.data);
  });

  it('should handle invalid data in updateMarchesEvolutionChart', () => {
    const invalidData = null;
    const consoleSpy = spyOn(console, 'warn');

    component.updateMarchesEvolutionChart(invalidData);

    expect(consoleSpy).toHaveBeenCalledWith('⚠️ Données d\'évolution des marchés invalides:', invalidData);
  });

  it('should apply date filter when both dates are selected', () => {
    component.startDate = new Date('2023-01-01');
    component.endDate = new Date('2023-12-31');
    const loadSpy = spyOn<any>(component, 'loadMarchesEvolutionData');

    component.applyDateFilter();

    expect(component.selectedPeriod).toBe('custom');
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should show alert when applying date filter without dates', () => {
    component.startDate = null;
    component.endDate = null;
    const alertSpy = spyOn(window, 'alert');

    component.applyDateFilter();

    expect(alertSpy).toHaveBeenCalledWith('Veuillez sélectionner une date de début et une date de fin');
  });

  it('should show alert when end date is before start date', () => {
    component.startDate = new Date('2023-12-31');
    component.endDate = new Date('2023-01-01');
    const alertSpy = spyOn(window, 'alert');

    component.applyDateFilter();

    expect(alertSpy).toHaveBeenCalledWith('La date de fin doit être postérieure à la date de début');
  });

  it('should require dates for PDF export', () => {
    component.startDate = null;
    component.endDate = null;
    const alertSpy = spyOn(window, 'alert');

    component.exportToPDF();

    expect(alertSpy).toHaveBeenCalledWith('Veuillez sélectionner une période d\'analyse avant d\'exporter');
  });

  it('should require dates for Excel export', () => {
    component.startDate = null;
    component.endDate = null;
    const alertSpy = spyOn(window, 'alert');

    component.exportToExcel();

    expect(alertSpy).toHaveBeenCalledWith('Veuillez sélectionner une période d\'analyse avant d\'exporter');
  });

  it('should format date for API correctly', () => {
    const testDate = new Date('2023-01-01');
    const formatted = component['formatDateForApi'](testDate);
    expect(formatted).toBe('2023-01-01');
  });

  it('should throw error when formatting null date for API', () => {
    expect(() => component['formatDateForApi'](null)).toThrowError('Date cannot be null');
  });
});
