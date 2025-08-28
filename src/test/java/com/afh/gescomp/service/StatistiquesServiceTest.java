package com.afh.gescomp.service;

import com.afh.gescomp.implementation.StatistiquesServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour le service des statistiques
 */
@ExtendWith(MockitoExtension.class)
class StatistiquesServiceTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private StatistiquesServiceImpl statistiquesService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(statistiquesService, "entityManager", entityManager);
    }

    @Test
    void testGetArticlesRepartition() {
        // Arrange
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(createMockArticlesData());

        // Act
        Map<String, Object> result = statistiquesService.getArticlesRepartition("03");

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("labels"));
        assertNotNull(result.get("data"));
        
        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");
        
        assertEquals(3, labels.size());
        assertEquals(3, data.size());
        assertEquals("GAZ", labels.get(0));
        assertEquals(45, data.get(0));
    }

    @Test
    void testGetRegionsRepartition() {
        // Arrange
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(createMockRegionsData());

        // Act
        Map<String, Object> result = statistiquesService.getRegionsRepartition("03");

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("labels"));
        assertNotNull(result.get("data"));
        
        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");
        
        assertEquals(3, labels.size());
        assertEquals(3, data.size());
        assertEquals("Tunis", labels.get(0));
        assertEquals(5, data.get(0));
    }

    @Test
    void testGetFournisseursRepartition() {
        // Arrange
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(createMockFournisseursData());

        // Act
        Map<String, Object> result = statistiquesService.getFournisseursRepartition("03", 5);

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("labels"));
        assertNotNull(result.get("data"));
        assertNotNull(result.get("colors"));
        
        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");
        @SuppressWarnings("unchecked")
        List<String> colors = (List<String>) result.get("colors");
        
        assertEquals(3, labels.size());
        assertEquals(3, data.size());
        assertEquals(3, colors.size());
        assertEquals("STE BOUZGUENDA", labels.get(0));
        assertEquals(3, data.get(0));
    }

    @Test
    void testGetMarchesEvolutionByPeriod() {
        // Arrange
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(createMockEvolutionData());

        // Act
        Map<String, Object> result = statistiquesService.getMarchesEvolutionByPeriod("03", "12months");

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("labels"));
        assertNotNull(result.get("data"));
        assertEquals("12months", result.get("period"));
        
        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");
        
        assertEquals(3, labels.size());
        assertEquals(3, data.size());
    }

    @Test
    void testGetMarchesEvolutionByDates() {
        // Arrange
        when(entityManager.createNativeQuery(anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(createMockEvolutionData());

        // Act
        Map<String, Object> result = statistiquesService.getMarchesEvolutionByDates("03", "2023-01-01", "2023-12-31");

        // Assert
        assertNotNull(result);
        assertNotNull(result.get("labels"));
        assertNotNull(result.get("data"));
        assertEquals("2023-01-01", result.get("dateDebut"));
        assertEquals("2023-12-31", result.get("dateFin"));
        
        @SuppressWarnings("unchecked")
        List<String> labels = (List<String>) result.get("labels");
        @SuppressWarnings("unchecked")
        List<Integer> data = (List<Integer>) result.get("data");
        
        assertEquals(3, labels.size());
        assertEquals(3, data.size());
    }

    // Méthodes utilitaires pour créer des données de test
    private List<Object[]> createMockArticlesData() {
        return List.of(
            new Object[]{"GAZ", 45},
            new Object[]{"EAU", 30},
            new Object[]{"ÉLECTRICITÉ", 15}
        );
    }

    private List<Object[]> createMockRegionsData() {
        return List.of(
            new Object[]{"Tunis", 5},
            new Object[]{"Sfax", 3},
            new Object[]{"Sousse", 2}
        );
    }

    private List<Object[]> createMockFournisseursData() {
        return List.of(
            new Object[]{"STE BOUZGUENDA", 3},
            new Object[]{"KBS CONSULTING", 2},
            new Object[]{"GEOMED", 1}
        );
    }

    private List<Object[]> createMockEvolutionData() {
        return List.of(
            new Object[]{"2023-01", 5},
            new Object[]{"2023-02", 8},
            new Object[]{"2023-03", 12}
        );
    }
} 