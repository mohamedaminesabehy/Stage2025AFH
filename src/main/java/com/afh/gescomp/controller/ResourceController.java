package com.afh.gescomp.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @RequestMapping(value = "/video/{videoName}", method = RequestMethod.GET)
    public ResponseEntity<?> streamVideo(@PathVariable String videoName,
                                         @RequestHeader(value = HttpHeaders.RANGE, defaultValue = "bytes=0-") String range){

        try {
            Path filePath = Paths.get("C:\\Oracle\\Middleware\\Oracle_Home\\user_projects\\domains\\wl_server\\servers\\AdminServer\\tmp\\_WL_user\\GESCOMP\\assets", videoName + ".mp4");
            //Path filePath = Paths.get("\\weblogic\\Oracle\\Middleware\\user_projects\\domains\\adf_domain\\servers\\AdminServer\\tmp\\_WL_user\\GESCOMP\\assets", videoName + ".mp4");
            File videoFile = filePath.toFile();

            if(!videoFile.exists()){
                return  ResponseEntity.status(HttpStatus.NOT_FOUND).body("Video not Found");
            }
            long fileSize = videoFile.length();
            long start = 0;
            long end = fileSize - 1;

            if (range != null && range.startsWith("bytes=")) {
                String[] ranges = range.substring(6).split("-");
                try {
                    start = Long.parseLong(ranges[0]);
                    if (ranges.length > 1 && !ranges[1].isEmpty()) {
                        end = Long.parseLong(ranges[1]);
                    }
                } catch (NumberFormatException e) {
                    start = 0;
                    end = fileSize - 1;
                }
            }

            if (start > end || end >=fileSize){
                return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                            .header("Content-Range","bytes */" + fileSize)
                            .build();
                }

                long contentLength = end - start + 1;

                InputStream inputStream = new BufferedInputStream(new FileInputStream(videoFile));
                inputStream.skip(start);

                HttpHeaders headers = new HttpHeaders();
                headers.add("Content-Type", "video/mp4");
                headers.add("Accept-Ranges", "bytes");
                headers.add("Content-Range", "bytes" + start + "-" + end + "/" + fileSize);
                return  ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                        .headers(headers)
                        .contentLength(contentLength)
                        .body(new InputStreamResource(inputStream));

        } catch (IOException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

    }

    @RequestMapping(value = "/doc/{fileName}", method = RequestMethod.GET)
    public ResponseEntity<Resource> downloadFile(@PathVariable("fileName") String fileName) {
        try {
            //Path filePath = Paths.get("\\weblogic\\Oracle\\Middleware\\user_projects\\domains\\adf_domain\\servers\\AdminServer\\tmp\\_WL_user\\GESCOMP\\assets")
            Path filePath = Paths.get("C:\\Oracle\\Middleware\\Oracle_Home\\user_projects\\domains\\wl_server\\servers\\AdminServer\\tmp\\_WL_user\\GESCOMP\\assets")
                    .resolve(fileName)
                    .normalize();

            FileSystemResource resource = new FileSystemResource(filePath.toFile());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body((Resource) resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }

    }

}
