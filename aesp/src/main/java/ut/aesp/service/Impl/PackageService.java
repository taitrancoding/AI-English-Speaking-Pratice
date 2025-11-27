package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import ut.aesp.dto.mentor.MentorSummaryResponse;
import ut.aesp.dto.packagee.PackageRequest;
import ut.aesp.dto.packagee.PackageResponse;
import ut.aesp.enums.PackageStatus;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.PackageMapper;
import ut.aesp.model.Mentor;
import ut.aesp.model.Package;
import ut.aesp.repository.MentorRepository;
import ut.aesp.repository.PackageRepository;
import ut.aesp.service.IPackageService;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PackageService implements IPackageService {

    private final PackageRepository repo;
    private final PackageMapper mapper;
    private final MentorRepository mentorRepository;

    @Override
    public PackageResponse create(PackageRequest payload) {
        Package p = mapper.toEntity(payload);
        applyMentors(p, payload.getMentorIds());
        Package saved = repo.save(p);
        return buildResponse(saved);
    }

    @Override
    public PackageResponse get(Long id) {
        ut.aesp.model.Package p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        return buildResponse(p);
    }

    @Override
    public PackageResponse update(Long id, PackageRequest payload) {
        ut.aesp.model.Package p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));

        if (payload.getName() != null)
            p.setName(payload.getName());
        if (payload.getDescription() != null)
            p.setDescription(payload.getDescription());
        if (payload.getPrice() != null)
            p.setPrice(payload.getPrice());
        if (payload.getDurationDays() != null)
            p.setDurationDays(payload.getDurationDays());
        if (payload.getHasMentor() != null)
            p.setHasMentor(payload.getHasMentor());
        if (payload.getStatus() != null) {
            try {
                p.setStatus(PackageStatus.valueOf(payload.getStatus()));
            } catch (IllegalArgumentException ex) {
                throw new ResourceNotFoundException("PackageStatus", "value", payload.getStatus());
            }
        }
        if (payload.getMentorIds() != null) {
            applyMentors(p, payload.getMentorIds());
        }

        ut.aesp.model.Package updated = repo.save(p);
        return buildResponse(updated);
    }

    @Override
    public void delete(Long id) {
        ut.aesp.model.Package p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        repo.delete(p);
    }

    @Override
    public Page<PackageResponse> list(Pageable pageable) {
        return repo.findAll(pageable).map(this::buildResponse);
    }

    private void applyMentors(Package entity, Set<Long> mentorIds) {
        if (mentorIds == null) {
            return;
        }
        if (mentorIds.isEmpty()) {
            entity.getMentors().clear();
            return;
        }
        var mentors = mentorRepository.findAllById(mentorIds);
        if (mentors.size() != mentorIds.size()) {
            throw new ResourceNotFoundException("Mentor", "ids", mentorIds.toString());
        }
        entity.getMentors().clear();
        entity.getMentors().addAll(new HashSet<>(mentors));
        if (!mentors.isEmpty()) {
            entity.setHasMentor(true);
        }
    }

    private PackageResponse buildResponse(Package entity) {
        PackageResponse response = mapper.toResponse(entity);
        if (entity.getMentors() != null) {
            response.setMentors(
                entity.getMentors().stream()
                    .map(this::toMentorSummary)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private MentorSummaryResponse toMentorSummary(Mentor mentor) {
        MentorSummaryResponse summary = new MentorSummaryResponse();
        summary.setId(mentor.getId());
        if (mentor.getUser() != null) {
            summary.setName(mentor.getUser().getName());
            summary.setEmail(mentor.getUser().getEmail());
        }
        summary.setSkills(mentor.getSkills());
        summary.setAvailabilityStatus(
            mentor.getAvailabilityStatus() != null ? mentor.getAvailabilityStatus().name() : null);
        return summary;
    }
}
