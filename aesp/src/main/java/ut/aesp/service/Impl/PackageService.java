package ut.aesp.service.Impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.aesp.dto.packagee.PackageRequest;
import ut.aesp.dto.packagee.PackageResponse;
import ut.aesp.enums.PackageStatus;
import ut.aesp.exception.ResourceNotFoundException;
import ut.aesp.mapper.PackageMapper;
import ut.aesp.repository.PackageRepository;
import ut.aesp.service.IPackageService;
import ut.aesp.model.Package;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional
public class PackageService implements IPackageService {

    private final PackageRepository repo;
    private final PackageMapper mapper;

    @Override
    public PackageResponse create(PackageRequest payload) {
        Package p = mapper.toEntity(payload);
        Package saved = repo.save(p);
        return mapper.toResponse(saved);
    }

    @Override
    public PackageResponse get(Long id) {
        ut.aesp.model.Package p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        return mapper.toResponse(p);
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
        if (payload.getStatus() != null)
            p.setStatus(PackageStatus.ACTIVE);

        ut.aesp.model.Package updated = repo.save(p);
        return mapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        ut.aesp.model.Package p = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package", "id", id));
        repo.delete(p);
    }

    @Override
    public Page<PackageResponse> list(Pageable pageable) {
        return repo.findAll(pageable).map(mapper::toResponse);
    }
}
