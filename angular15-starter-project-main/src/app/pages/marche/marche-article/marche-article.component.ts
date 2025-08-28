import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MarcheAddEditComponent } from '../marche/marche-add-edit/marche-add-edit/marche-add-edit.component';
import { MatButtonModule } from '@angular/material/button';
import { SpinnerService } from 'src/app/services/spinner/spinner.service';
import { CoreService } from 'src/app/services/core/core.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import {  MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Article, PartialArticle } from 'src/app/model/article';
import { ArticleService } from 'src/app/services/article/article.service';
import { PrmtypeserieService } from 'src/app/services/prmtypeserie/prmtypeserie.service';
import { MrcarticleService } from 'src/app/services/mrcarticle/mrcarticle.service';
import { ConfirmDialogComponent } from 'src/app/dialog/confirm-dialog/confirm-dialog.component';
import { PrmTypeSerie } from 'src/app/model/prmTypeSerie';
import { bottom } from '@popperjs/core';
import { validateurMrcArticle } from 'src/app/services/MrcArticleValidator/validateurMrcArticle';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MrcArticle } from 'src/app/model/mrcArticle';
import { MarcheService } from 'src/app/services/marche/marche.service';
import { SelectNumArticleDialogComponent } from '../dialog/select-num-article-dialog/select-num-article-dialog.component';
import { Observable, tap } from 'rxjs';


@Component({
  selector: 'app-marche-article',
  standalone: true,
  imports: [
    MarcheAddEditComponent,
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatTableModule,
    MatGridListModule,
    MatRadioModule,
    MatTooltipModule,
    FormsModule],
  templateUrl: './marche-article.component.html',
  styleUrl: './marche-article.component.scss'
})
export class MarcheArticleComponent implements OnInit {
  mrcArticleForm: FormGroup;
  numArticlesOptionsForExistingMrcArticle: Article[] = [];
  prm_type_series: PrmTypeSerie[] = [];
  numMarche!: number;
  idLot!: string;
  selectedIndex = 0;
  loadingError: string | null = null;
  itemSize: number = 0;
  isLoading = false;
  loadedNumArticles = new Set<string>(); // Suivi des articles déjà chargés pour éviter les doublons
  numArticlePage: {[key: number]: number } = {};
  hasMoreArticles = true;
  isNumArticleDisabled = false;
  isDisabledDesignationPrm: boolean = true;
  pageSize:number = 10;
  currentPage:number = 0;
  totalElements:number = 0;
  totalPages:number = 0;
  selectedNumArticles: Set<string> = new Set();
  isExistingArticle: boolean = false; // Indicateur pour déterminer l'état de l'article
  numArticlesOptions: Article[][] = [];
  selectedArticleNumero: string = '';
  expanded: { [key: number]: boolean } = {};
  detailsArticle: MrcArticle | null = null;
  numArticleForExpansion: string | undefined = undefined;
  finalExpansionArticle: any;
  expandedDetails: { [index: number]: any } = {}; 
  allArticles: Article[] = [];
  modifiedMrcMap: Map<number, any> = new Map();

  lastMaxIdArticle: number = 0; // Variable pour stocker le dernier ID
  allLoadedArticleIds: number[] = [];

  private deletedArticleIds: Set<number> = new Set();  // Set pour garder trace des IDs supprimés


  constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedMrclots: any[], additionalData: any },
    private _dialogRef: MatDialogRef<MarcheArticleComponent>,
    private dialog: MatDialog,
    public _spinnerService: SpinnerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private articleService: ArticleService,
    private prmTypeSerie: PrmtypeserieService,
    private mrcArticleService: MrcarticleService,
    private marcheService:MarcheService,
    private _coreService: CoreService,
  ) {
    this.mrcArticleForm = this.fb.group({
      MrcArticles: this.fb.array([], { asyncValidators: [validateurMrcArticle()] })
    });
    this.data.selectedMrclots.forEach(mrclot => {
      this.numMarche = mrclot.numMarche;
      this.idLot = mrclot.idPrmLotDetails.idLot;
      
    });
    };

  get MrcArticles() {
      return this.mrcArticleForm.get('MrcArticles') as FormArray;
  }

  getSearchTermControl(index: number): FormControl {
    const mrcArticleGroup = this.MrcArticles.at(index) as FormGroup;
    return mrcArticleGroup.get('numArticle')?.get('searchTerm') as FormControl;
  }
    
  ngOnInit(): void {
    this.loadTypeSeries();
    this.loadMaxIdArticle(); // Appel pour charger l'id maximal existant
    this.loadInitialArticles(); 
  }
  
  addExistingMrcAticle(article): void {
    const articleId = article.id.idArticle;
  
    const modified = this.modifiedMrcMap.get(articleId);
    const mergedArticle = modified ? { ...article, ...modified } : article;
  
    const mrcArticleGroup = this.fb.group({
      id: this.fb.group({
        idArticle: [mergedArticle.id.idArticle],
        ap: [1],
        idLot: [this.idLot],
        numMarche: [this.numMarche],
      }),
      numArticle: this.fb.group({
        numArticle: [{ value: mergedArticle.numArticle.numArticle, disabled: this.isDisabledDesignationPrm }, Validators.required],
        designation: [mergedArticle.numArticle.designation || ''],
        designationFr: [mergedArticle.numArticle.designationFr || '']
      }),
      idTypeSerie: [mergedArticle.idTypeSerie?.id, Validators.required],
      mrcLot: this.fb.group({
        id: this.fb.group({
          idLot: [this.idLot],
          numMarche: [this.numMarche]
        })
      }),
      prixUnitaire: [mergedArticle.prixUnitaire],
      quantite: [mergedArticle.quantite],
      description: [mergedArticle.description],
      tva: [mergedArticle.tva, [Validators.min(0), Validators.max(99.99)]],
      codeArticle: [mergedArticle.codeArticle],
      chAp: [mergedArticle.chAp === 1 ? 1 : 0],
      prixFourniture: [mergedArticle.prixFourniture],
      isNew: [false]
    });
  
    const chApControl = mrcArticleGroup.get('chAp') as FormControl<number | null> | null;
    const prixFournitureControl = mrcArticleGroup.get('prixFourniture') as FormControl<number | null> | null;
  
    if (chApControl && prixFournitureControl) {
      const updatePrixFournitureState = (value: boolean) => {
        if (value) {
          prixFournitureControl.enable();
          prixFournitureControl.setValidators([Validators.required]);
          if (prixFournitureControl.value == null) {
            prixFournitureControl.setValue(mergedArticle.prixFourniture ?? 0);
          }
        } else {
          prixFournitureControl.disable();
          prixFournitureControl.clearValidators();
          prixFournitureControl.setValue(null);
        }
        prixFournitureControl.updateValueAndValidity();
      };
  
      // Initialisation selon valeur de chAp
      updatePrixFournitureState(chApControl.value === 1);
  
      // Sur changement du slide toggle
      chApControl.valueChanges.subscribe((value: number | null) => {
        updatePrixFournitureState(value === 1);
      });
    }
  
    mrcArticleGroup.valueChanges.subscribe(() => {
      const raw = mrcArticleGroup.getRawValue();
      const id = raw.id?.idArticle;
      if (id != null) {
        const original = this.MrcArticles.controls.find(ctrl => ctrl.get('id.idArticle')?.value === id)?.getRawValue();
        const merged = {
          ...original,
          ...raw,
          id: {
            ...original?.id,
            ...raw.id
          },
          numArticle: {
            ...original?.numArticle,
            ...raw.numArticle
          },
          idTypeSerie: raw.idTypeSerie != null
            ? { id: raw.idTypeSerie }
            : original?.idTypeSerie
        };
        this.modifiedMrcMap.set(id, merged);
      }
    });
  
    this.MrcArticles.push(mrcArticleGroup);
  }
  
  
  addMrcArticle(): void {
    let newIdArticle: number;

    if (this.deletedArticleIds.size > 0) {
        // Si des IDs supprimés sont disponibles, utilisez l'ID minimum disponible.
        newIdArticle = Math.min(...Array.from(this.deletedArticleIds));
        this.deletedArticleIds.delete(newIdArticle);  // Retirer l'ID du Set après utilisation.
    } else {
        // Si aucun ID supprimé, utilisez l'incrémentation.
        newIdArticle = this.lastMaxIdArticle + 1;
        this.lastMaxIdArticle++;  // Incrémentation pour le prochain ID.
    }
    const mrcArticleGroup = this.fb.group({
        id: this.fb.group({
            idArticle: [newIdArticle],
            ap: [1],
            idLot: [this.idLot],
            numMarche: [this.numMarche],
        }),
        numArticle: this.fb.group({
            numArticle: [{ value: null, disabled: !this.isDisabledDesignationPrm }, Validators.required],
            searchTerm: [''],
            designation: ['']
        }),
        idTypeSerie: ['', Validators.required],
        mrcLot: this.fb.group({
            id: this.fb.group({
                idLot: [this.idLot],
                numMarche: [this.numMarche]
            })
        }),
        prixUnitaire: [null],
        quantite: [null],
        description: [''],
        tva: [null, [Validators.min(0), Validators.max(99.99)]],
        codeArticle: [''],
        chAp: [0],
        prixFourniture: [null],
        isNew: [true]
    });

    const prixFournitureControl = mrcArticleGroup.get('prixFourniture') as FormControl<number | null> | null;
    const chApControl = mrcArticleGroup.get('chAp') as FormControl<number | null> | null;

    // Initialisation selon valeur initiale de chAp
    if (prixFournitureControl && chApControl) {
        if (chApControl.value === 1) {
            prixFournitureControl.enable();
            prixFournitureControl.setValidators([Validators.required]);
            if (prixFournitureControl.value == null) {
                prixFournitureControl.setValue(0);
            }
        } else {
            prixFournitureControl.disable();
            prixFournitureControl.clearValidators();
            prixFournitureControl.setValue(null);
        }
        prixFournitureControl.updateValueAndValidity();
    
        chApControl.valueChanges.subscribe((value: number | null) => {
            if (value === 1) {
                prixFournitureControl.enable();
                prixFournitureControl.setValidators([Validators.required]);
                if (prixFournitureControl.value == null) {
                    prixFournitureControl.setValue(0);
                }
            } else {
                prixFournitureControl.disable();
                prixFournitureControl.clearValidators();
                prixFournitureControl.setValue(null);
            }
            prixFournitureControl.updateValueAndValidity();
        });
    }

    mrcArticleGroup.valueChanges.subscribe(() => {
        const raw = mrcArticleGroup.getRawValue();
        const id = raw.id?.idArticle;
        if (id != null) {
            const original = this.MrcArticles.controls.find(ctrl => ctrl.get('id.idArticle')?.value === id)?.getRawValue();
            const merged = {
                ...original,
                ...raw,
                id: {
                    ...original?.id,
                    ...raw.id
                },
                numArticle: {
                    ...original?.numArticle,
                    ...raw.numArticle
                },
                idTypeSerie: raw.idTypeSerie != null
                    ? { id: raw.idTypeSerie }
                    : original?.idTypeSerie
            };
            this.modifiedMrcMap.set(id, merged);
        }
    });

    this.MrcArticles.push(mrcArticleGroup);
    this.loadNumArticlesOptions(this.MrcArticles.length - 1);
  }

  removeArticle(index: number): void {
    if (index < this.MrcArticles.length - 1) {
        this._coreService.openSnackBar('Impossible de supprimer cet article car il n\'est pas le dernier.', 'Ok');
        return;
    }

    const articleControl = this.MrcArticles.at(index);

    // Vérifier si c'est un nouvel article
    const isNew = articleControl.get('isNew')?.value;

    const idArticleGroup = articleControl.get('id') as FormGroup;
    const removedArticle = idArticleGroup.get('idArticle')?.value;
    const numArticleGroup = articleControl.get('numArticle') as FormGroup;
    const numArticleValue = numArticleGroup?.get('numArticle')?.value;

    // === Cas 1 : Suppression d'un nouvel article (pas encore envoyé au backend)
    if (isNew) {
        this.MrcArticles.removeAt(index);
        this.deletedArticleIds.add(removedArticle); // Marquer l'ID comme réutilisable
        return;
    }

    // === Cas 2 : Suppression d'un article existant (déjà en base)
    if (!numArticleValue || !removedArticle) {
        this.MrcArticles.removeAt(index);
        return;
    }

    // Enregistrer l'ID dans deletedArticleIds (optionnel selon logique métier)
    this.deletedArticleIds.add(removedArticle);

    const numMarche = this.numMarche;
    const idLot = this.idLot;

    // Appel au backend pour suppression
    this.mrcArticleService.deleteMrcArticle(numArticleValue, numMarche, 1, idLot, removedArticle)
        .subscribe({
            next: () => {
                this.MrcArticles.removeAt(index);
                this._coreService.openSnackBar('Article supprimé avec succès.', 'Ok');
                this.selectedIndex = 0;
            },
            error: (err) => {
                console.error('Erreur lors de la suppression de l\'article:', err);
                this.loadingError = 'Erreur de suppression de l\'article marche.';
                setTimeout(() => {
                    this.loadingError = null;
                }, 3000);
            }
        });

    // Supprimer l'article du map des articles modifiés
    this.modifiedMrcMap.delete(removedArticle);
}


  
  onCheckboxChange(index: number, isChecked: boolean): void {
    const control = this.MrcArticles.at(index);
    const chApControl = control.get('chAp') as FormControl<number | null>;
    const prixFournitureControl = control.get('prixFourniture') as FormControl<number | null>;
  
    if (chApControl && prixFournitureControl) {
      chApControl.setValue(isChecked ? 1 : 0);  // On met à jour chAp avec 1 ou 0
      if (isChecked) {
        prixFournitureControl.enable();
        prixFournitureControl.setValidators([Validators.required]);
        if (prixFournitureControl.value == null) {
          prixFournitureControl.setValue(0);  // Si le prix est null, on le met à 0
        }
      } else {
        prixFournitureControl.disable();
        prixFournitureControl.clearValidators();
        prixFournitureControl.setValue(null);  // Si non sélectionné, on désactive et met à null
      }
      prixFournitureControl.updateValueAndValidity();
    }
  }
  

  onSave(): void {
    console.log('modifiedMrcMap avant map:', this.modifiedMrcMap);
  
    const mrcArticles: any[] = Array.from(this.modifiedMrcMap.values()).map((mrcArticle: any) => {
      console.log('Article en cours de traitement:', mrcArticle);
  
      const baseArticle = {
        id: {
          numMarche: this.numMarche,
          idLot: this.idLot,
          idArticle: mrcArticle.id.idArticle,
          ap: 1
        },
        numArticle: {
          numArticle: mrcArticle.numArticle.numArticle
        },
        mrcLot: {
          id: {
            idLot: this.idLot,
            numMarche: this.numMarche
          }
        },
        idTypeSerie: mrcArticle.idTypeSerie,  // ID uniquement
        description: mrcArticle.description,
        prixUnitaire: mrcArticle.prixUnitaire,
        quantite: mrcArticle.quantite,
        tva: mrcArticle.tva,
        codeArticle: mrcArticle.codeArticle,
        chAp: mrcArticle.chAp ? 1 : 0,  // Conversion de boolean à number ici
        prixFourniture: mrcArticle.prixFourniture // Assurez-vous que cette ligne existe
      };
  
      // Validation du champ prixFourniture lorsque chAp est activé
      if (baseArticle.chAp === 1) {
        if (baseArticle.prixFourniture == null || baseArticle.prixFourniture <= 0) {
          console.error('Le champ prixFourniture doit être rempli et supérieur à 0 lorsque chAp est activé.');
          return null;  // Retourner null pour cet article si la validation échoue
        } else {
          return baseArticle; // Retourner directement l'article validé
        }
      } else {
        return {
          ...baseArticle,
          prixFourniture: null  // Mettre à null si chAp est désactivé
        };
      }
    }).filter(article => article !== null);  // Exclure les articles invalides
  
    console.log('Articles to submit:', mrcArticles);
  
    // Soumettre les modifications à l'API
    this.mrcArticleService.saveOrUpdateMrcArticles(mrcArticles).subscribe({
      next: (response) => {
        this.marcheService.calculateMontants(mrcArticles[0].id.numMarche).subscribe(res => {
          console.log(res);
        });
        console.log('Articles enregistrés avec succès:', response);
  
        this._coreService.openSnackBar('Soumission des Articles avec succès', 'Ok');
        this._dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement des articles:', err);
      }
    });
  }

  loadMaxIdArticle(): void {
    this.mrcArticleService.getMaxIdArticle(this.numMarche, this.idLot).subscribe({
      next: (maxId: number) => {
        this.lastMaxIdArticle = maxId;
        console.log("ID maximal chargé:", this.lastMaxIdArticle);
      },
      error: (err) => {
        console.error("Erreur chargement maxIdArticle", err);
        this.lastMaxIdArticle = 1; // par défaut
      }
    });
  }
  

  loadInitialArticles(): void {
    this._spinnerService.show(); // Afficher le spinner pendant le chargement
  
    // Appel à l'API pour récupérer les articles avec pagination
    this.mrcArticleService.getMrcArticlesForProd(this.numMarche, this.idLot, this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
  
        // Vérifie si la réponse contient des articles et gère la pagination
        if (response && response.content && Array.isArray(response.content)) {
          this.MrcArticles.clear();
          const existingMrcArticles = response.content;  // Accéder aux articles dans "content"
  
          // Si on reçoit des articles, on les traite
          existingMrcArticles.forEach((MrcArticle) => {
            this.addExistingMrcAticle(MrcArticle);  // Ajoute les articles dans la liste
            const numArticle = MrcArticle.numArticle ? MrcArticle.numArticle.numArticle : null;
  
            // Ajouter les articles non encore chargés dans la liste
            if (!this.loadedNumArticles.has(numArticle)) {
              this.numArticlesOptionsForExistingMrcArticle.push(MrcArticle.numArticle);
              this.loadedNumArticles.add(numArticle);
            }
          });
          
          // Mettre à jour les informations de pagination
          this.totalElements = response.totalElements;  // Total des articles
          this.totalPages = response.totalPages;  // Nombre total de pages
          this.currentPage = response.number;  // Page actuelle

          console.log(`Total articles: ${this.totalElements}, Total pages: ${this.totalPages}`);
          console.log(this.lastMaxIdArticle)
        }
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des articles:', error);
        this._coreService.openSnackBar("Erreur lors du chargement des articles", "OK");
      },
      complete: () => {
        // Cacher le spinner après le traitement des articles
        this._spinnerService.hide();
      }
    });
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadInitialArticles();
    }
  }

  // Méthode pour aller à la page précédente
  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadInitialArticles();
    }
  }

  // Méthode pour aller à la première page
  firstPage(): void {
    this.currentPage = 0;
    this.loadInitialArticles();
  }

  // Méthode pour aller à la dernière page
  lastPage(): void {
    this.currentPage = this.totalPages - 1;
    this.loadInitialArticles();
  }
  
  
  loadNumArticlesOptions(index: number, searchTerm: string = ''): void {
    if (!Array.isArray(this.numArticlesOptions[index])) {
      this.numArticlesOptions[index] = [];  
    }
  
    if (this.numArticlePage[index] === undefined) {
      this.numArticlePage[index] = 0; 
    }
  
    const page = this.numArticlePage[index];
    console.log('Page à charger:', page);
  
    
      this.articleService.getArticleOptions(page, searchTerm).subscribe((newOptions) => {
        console.log(newOptions)
        if (Array.isArray(newOptions)) {
          this.numArticlesOptions[index] = [...this.numArticlesOptions[index], ...newOptions];
          this.numArticlePage[index] += 1; 
        } else {
          console.error('Erreur: newOptions n\'est pas un tableau valide:', newOptions);
        }
      }, (error) => {
        console.error('Erreur lors de la récupération des options:', error);
      });
    
  }
  
  isPageLoaded(index:number, page:number): boolean {
    const start = page * 10;
    const end = start + 10;
    return !!this.numArticlesOptions[index]?.slice(start, end).length;

  }
  
  trackByNumArticle(index: number, option: Article): string {
    return option.numArticle; 
  }

  onNoClick(): void {
    this._dialogRef.close(true)
  }

  selectedIndexChange(val: number) {
    this.selectedIndex = val;
  }






  openConfirmArticleDialog(numArticle: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de Suppression',
        message: 'Êtes-vous sûr de vouloir supprimer l\'article ?',
        confirmButtonText: 'Supprimer',
        isDeleteAction: true

      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeArticle(numArticle);
      }
    });
  }

  loadTypeSeries(): void {
    this._spinnerService.show();
    this.isLoading = true;
    this.prmTypeSerie.getprmTypeSerie().subscribe({
      next: (response: PrmTypeSerie[]) => {
        this.prm_type_series = response;
      },
      error: (err) => {
        console.error('Error loading articles', err);
      },
      complete: () => {
        this.isLoading = false;
        this._spinnerService.hide();
      },
    });
  }

  resetPrmTypeSerieSelection(index: number): void {
    const MrcArticle = this.MrcArticles.at(index);
    if (MrcArticle) {
      MrcArticle.get('idTypeSerie')?.setValue(null);
    }
  }

  onPrmTypeSerieSelect(selectedPrmTypeSerie: string): void {
    console.log('Selected PrmTypeSerie:', selectedPrmTypeSerie);
  }


  
  
  
  onScroll(event: any, index: number): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 10 && !this.isLoading) {
      const searchTerm = this.getSearchTermControl(index).value;
      this.loadNumArticlesOptions(index,searchTerm);  
    }
  }

  onClearSearchClick(index: number): void {
    console.log(`Clear button clicked for index ${index}`);
    const searchControl = this.getSearchTermControl(index);
    searchControl.setValue('');
    this.numArticlesOptions[index] = []; 
    this.numArticlePage[index] = 0;
    this.loadNumArticlesOptions(index, '');
  }

  isArticleExisting(mrcArticle: FormGroup): boolean {
    return !mrcArticle.get('isNew')?.value; 
  }

  onSearchTermChange(event: any, index: number): void {
    const searchTerm = event.target.value; // Récupère la valeur tapée
    this.numArticlesOptions[index] = []; // Réinitialise les options de l'article à cet index
    this.numArticlePage[index] = 1; // Réinitialise la page pour cette liste déroulante
    this.loadNumArticlesOptions(index, searchTerm); // Charge les nouvelles options filtrées
  }

  resetDesignationArticleSelection(i: number): void {
    const MrcArticle = this.MrcArticles.at(i);
    const numArticleControl = MrcArticle.get('numArticle')?.get('numArticle') as FormControl;
    const desiagntionControl =  MrcArticle.get('numArticle')?.get('designation') as FormControl;
    if (numArticleControl) {
      numArticleControl.setValue(null); 
    }
    if(desiagntionControl){
      desiagntionControl.setValue(null);
    }
    const searchTermControl = MrcArticle.get('numArticle')?.get('searchTerm') as FormControl;
    if (searchTermControl) {
      searchTermControl.setValue(''); 
    }
  }

  isSubmitDisabled(): boolean {
    return this.MrcArticles.controls.some(control =>
      control.get('numArticle')?.invalid || control.get('idTypeSerie')?.invalid || control.get('prixFourniture')?.invalid || control.get('tva')?.invalid
    );
  }



  openConfirmSaveMrcArticleDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmation de soumession',
        message: 'Êtes-vous sûr de vouloir soumettre ces derniéres modifications ?',
        confirmButtonText: 'Soumettre'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.onSave();
      }
    });
  }


  toggleRowExpansion(index: number) {
    // Inverser l'état d'expansion
    this.expanded[index] = !this.expanded[index];

    const idArticleForIndex = this.MrcArticles.controls[index].get('id.idArticle')?.value;
    const idLotForIndex = this.MrcArticles.controls[index].get('id.idLot')?.value;
    const numMarcheForIndex = this.MrcArticles.controls[index].get('id.numMarche')?.value;

    if (this.expanded[index]) {
      // Charger les détails de l'article uniquement lorsque la ligne est étendue
      this.mrcArticleService.getMrcArticleForExpansion(numMarcheForIndex, idLotForIndex, idArticleForIndex).subscribe((MrcArticle: any) => {
        console.log(MrcArticle);
        // Stocker les détails spécifiques de cet article dans le tableau expandedDetails
        this.expandedDetails[index] = MrcArticle;

        const numArticleForExpansion = MrcArticle?.id?.numArticle;

        // Charger les informations supplémentaires si nécessaire
        this.articleService.getArticleByNumArticle(numArticleForExpansion!).subscribe((Article) => {
          console.log(Article);
          // Mettre à jour les détails de l'article dans expandedDetails
          this.expandedDetails[index] = { ...this.expandedDetails[index], ...Article };
        });
      });
    } else {
      // Si la ligne est repliée, vider les détails stockés pour cette ligne
      delete this.expandedDetails[index];
    }
  }

  isRowExpanded(index: number): boolean {
    return !!this.expanded[index];
  }

  openArticleSelectionDialog(index: number): void {
    if (!this.allArticles || this.allArticles.length === 0) {
      this.loadArticles().subscribe((articles: Article[]) => {
        this.openDialogWithArticles(index, articles);
      });
    } else {
      this.openDialogWithArticles(index, this.allArticles);
    }
  }
  
  openDialogWithArticles(index: number, articles: Article[]): void {
    const dialogRef = this.dialog.open(SelectNumArticleDialogComponent, {
      width: '1500px',
      height: '800px',
      data: { articles }
    });
  
    dialogRef.afterClosed().subscribe((selectedArticle: Article) => {
      if (selectedArticle) {
        const mrcArticle = this.MrcArticles.at(index);
        mrcArticle.get('numArticle')?.get('numArticle')?.setValue(selectedArticle.numArticle);
        mrcArticle.get('numArticle')?.get('designation')?.setValue(selectedArticle.designation);
        mrcArticle.get('numArticle')?.get('designationFr')?.setValue(selectedArticle.designationFr);
        this.numArticlesOptions[index] = [selectedArticle];
      }
    });
  }
  
  loadArticles(): Observable<Article[]> {
    return this.articleService.getArticles().pipe(
      tap((res: Article[]) => this.allArticles = res)
    );
  }
   
}
