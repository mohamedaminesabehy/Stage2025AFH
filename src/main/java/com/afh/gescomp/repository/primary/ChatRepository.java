

package com.afh.gescomp.repository.primary;

import com.afh.gescomp.model.primary.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat,Long> {
    @Query("SELECT c FROM Chat c WHERE (c.senderMatricule = :sender AND c.receiverMatricule = :receiver) OR (c.senderMatricule = :receiver AND c.receiverMatricule = :sender) ORDER BY c.id ASC")
    List<Chat> findMessagesBetweenUserAndAdmins(@Param("sender") String sender, @Param("receiver") String receiver);

    @Modifying
    @Query("DELETE FROM Chat c WHERE " +
            "(c.senderMatricule = :sender AND c.receiverMatricule = :receiver) OR " +
            "(c.senderMatricule = :receiver AND c.receiverMatricule = :sender)")
    void deleteMessagesBetweenUserAndAdmins(@Param("sender") String sender, @Param("receiver") String receiver);

}

