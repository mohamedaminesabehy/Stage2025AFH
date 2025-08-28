package com.afh.gescomp.controller;

import com.afh.gescomp.model.primary.Chat;
import com.afh.gescomp.repository.primary.ChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatRepository chatRepository;


    @RequestMapping(value = "/send",method = RequestMethod.POST)
    public void sendMessage(@RequestBody Chat chat) {
        // Enregistrer le message dans la base de données
        chatRepository.save(chat);
        // Destinataire basé sur receiverMatricule
        messagingTemplate.convertAndSend(
                "/topic/chat/" + chat.getReceiverMatricule(),  // Canal unique pour chaque utilisateur
                chat
        );
    }

    // Récupérer les messages pour un matricule
    @RequestMapping(value = "/messages", method = RequestMethod.POST)
    public List<Chat> getMessagesBetweenAdminAndUser(@RequestBody Map<String, String> payload) {
        String senderMatricule = payload.get("senderMatricule");
        String receiverMatricule = payload.get("receiverMatricule");
        return chatRepository.findMessagesBetweenUserAndAdmins(senderMatricule, receiverMatricule);
    }
    @Transactional
    @RequestMapping(value = "/messages", method = RequestMethod.DELETE)
    public ResponseEntity<Void> deleteMessagesBetweenAdminAndUser(@RequestBody Map<String, String> payload) {
        String senderMatricule = payload.get("senderMatricule");
        String receiverMatricule = payload.get("receiverMatricule");
        chatRepository.deleteMessagesBetweenUserAndAdmins(senderMatricule, receiverMatricule);
        return ResponseEntity.ok().build();
    }
}
