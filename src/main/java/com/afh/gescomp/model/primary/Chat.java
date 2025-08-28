

package com.afh.gescomp.model.primary;

import lombok.*;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.io.Serializable;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity(name = "Chat")
@Table(name = "CHAT", schema = "ACHAT")
public class Chat implements Serializable {
    private static final long serialVersionUID = -1478796447326881897L;
    private Long id;

    private String senderMatricule;

    private String receiverMatricule;

    private String message;

    private String numStruct;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "CHAT_SEQ")
    @SequenceGenerator(name = "CHAT_SEQ", sequenceName = "ACHAT.SEQ_CHAT", allocationSize = 1)
    @Column(name = "ID", nullable = false)
    public Long getId() {
        return id;
    }

    @Size(max = 20)
    @Column(name = "SENDER_MATRICULE", length = 20)
    public String getSenderMatricule() {
        return senderMatricule;
    }

    @Size(max = 20)
    @Column(name = "RECEIVER_MATRICULE", length = 20)
    public String getReceiverMatricule() {
        return receiverMatricule;
    }

    @Lob
    @Column(name = "MESSAGE")
    public String getMessage() {
        return message;
    }

    @Size(max = 20)
    @Column(name = "NUM_STRUCT", length = 20)
    public String getNumStruct() {
        return numStruct;
    }

}

