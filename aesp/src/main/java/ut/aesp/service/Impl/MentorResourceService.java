package ut.aesp.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.mentor.MentorResourceRequest;
import ut.aesp.dto.mentor.MentorResourceResponse;
import ut.aesp.enums.EnglishLevel;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.model.Mentor;
import ut.aesp.model.MentorResource;
import ut.aesp.repository.MentorRepository;
import ut.aesp.repository.MentorResourceRepository;
import ut.aesp.service.IMentorResourceService;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class MentorResourceService implements IMentorResourceService {

  private final MentorResourceRepository resourceRepository;
  private final MentorRepository mentorRepository;

  @Override
  public MentorResourceResponse createResource(Long mentorId, MentorResourceRequest request) {
    Mentor mentor = mentorRepository.findById(mentorId)
        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", mentorId));

    MentorResource resource = new MentorResource();
    resource.setMentor(mentor);
    resource.setTitle(request.getTitle());
    resource.setDescription(request.getDescription());
    resource.setResourceType(request.getResourceType());
    resource.setFileUrl(request.getFileUrl());
    resource.setExternalUrl(request.getExternalUrl());
    resource.setCategory(request.getCategory());
    resource.setTargetLevel(request.getTargetLevel());
    resource.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : false);

    MentorResource saved = resourceRepository.save(resource);
    return toResponse(saved);
  }

  @Override
  public MentorResourceResponse getResource(Long id) {
    MentorResource resource = resourceRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("MentorResource", "id", id));
    return toResponse(resource);
  }

  @Override
  public List<MentorResourceResponse> getResourcesByMentor(Long mentorId) {
    return resourceRepository.findAllByMentorId(mentorId).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public List<MentorResourceResponse> getPublicResources() {
    return resourceRepository.findAllByIsPublicTrue().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public List<MentorResourceResponse> getResourcesByCategoryAndLevel(String category, EnglishLevel level) {
    return resourceRepository.findAllByCategoryAndTargetLevel(category, level).stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public void deleteResource(Long id, Long mentorId) {
    MentorResource resource = resourceRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("MentorResource", "id", id));
    
    if (!resource.getMentor().getId().equals(mentorId)) {
      throw new RuntimeException("You are not authorized to delete this resource");
    }
    
    resourceRepository.delete(resource);
  }

  private MentorResourceResponse toResponse(MentorResource resource) {
    MentorResourceResponse response = new MentorResourceResponse();
    response.setId(resource.getId());
    response.setMentorId(resource.getMentor().getId());
    response.setMentorName(resource.getMentor().getUser() != null
        ? resource.getMentor().getUser().getName()
        : null);
    response.setTitle(resource.getTitle());
    response.setDescription(resource.getDescription());
    response.setResourceType(resource.getResourceType());
    response.setFileUrl(resource.getFileUrl());
    response.setExternalUrl(resource.getExternalUrl());
    response.setCategory(resource.getCategory());
    response.setTargetLevel(resource.getTargetLevel());
    response.setIsPublic(resource.getIsPublic());
    response.setCreatedAt(resource.getCreatedAt());
    return response;
  }
}


